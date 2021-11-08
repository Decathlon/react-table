// / <reference lib="es2017.string" />
import * as React from "react";

import { IOnScroll } from "./useScroller";
import {
  addSequentialIndexesToFixedIndexList,
  getElevatedIndexes,
  IElevateds,
  scrollIndexToGridIndex,
  findFirstNotIncluded,
  FixedCustomSizesElements,
  getIndexScrollMapping,
} from "../components/utils/table";
import { MIN_COLUMN_WIDTH } from "../components/constants";
import { Nullable } from "../components/typing";
import useStableValue from "../hooks/useStableValue";

export interface OnScrollProps {
  scrollValues: IOnScroll;
  newItemsState: Nullable<IState>;
  itemsCursor: number;
}

export interface IVirtualizerOptionalProps {
  /** List of fixed items on the left or right of your table */
  fixedItems: number[];
  /** Specifies indexes of the items to be shown */
  hiddenItems: number[];
  /** Number of items that should be visible on screen */
  itemsCount?: number;
  /** Minimal size of a item */
  minItemSize?: number;
  /** Sum of the size of fixed items with a pre-defined size */
  fixedItemsSize: FixedCustomSizesElements;
  /** A pre-defined padding of the grid */
  padding: number;
  /** Initial scroll postions */
  initialScroll: number;
  /** The scroll handler */
  onScroll: (props: OnScrollProps) => void;
}

export interface IVirtualizerProps extends IVirtualizerOptionalProps {
  /**  The size of the visible window */
  containerSize: number;
  /** Number of items of the child element */
  itemsLength: number;
  getScrollValue: () => number | null;
  scrollTo: (newScrollValue: number) => boolean;
}

export interface IState {
  /** Indexes of the items to be always displayed */
  visibleItemIndexes: number[];
  /** Indexes of the items that need to appear "elevated" thanks to a shadow */
  elevatedItemIndexes: IElevateds;
}

interface VirtualizerCache {
  itemsCount: number;
  itemSize: number;
  visibleFixedItems: number[];
  virtualSize: number;
  itemIndexesScrollMapping: number[];
  visibleItemIndexes: Record<number, number[]>;
  ignoredIndexes: Record<number, true>;
  elevatedItemIndexes: Map<number[], IElevateds>;
}

export interface IVirtualizerController {
  virtualSize: number;
  itemsCount: number;
  itemSize: number;
  visibleItemIndexes: number[];
  elevatedItemIndexes: IElevateds;
  updateVisibleItems: (scrollValues: IOnScroll) => void;
  goToItemIndex: (itemIndex: number) => boolean;
}

function useVirtualizer(props: IVirtualizerProps, ref?: React.RefObject<IVirtualizerController>): IVirtualizerController {
  const {
    containerSize,
    itemsLength,
    itemsCount,
    minItemSize = MIN_COLUMN_WIDTH,
    fixedItems = [],
    hiddenItems = [],
    fixedItemsSize = {
      sum: 0,
      count: 0,
      customSizes: {},
    },
    padding,
    initialScroll,
    getScrollValue,
    scrollTo,
    onScroll,
  } = props;
  const stableFixedItems = useStableValue(fixedItems);
  const stableHiddenItems = useStableValue(hiddenItems);

  const isInitialized = React.useRef(false);
  const cache = React.useRef<VirtualizerCache>({
    itemsCount: 0,
    itemSize: 0,
    visibleFixedItems: [],
    virtualSize: 0,
    itemIndexesScrollMapping: [],
    visibleItemIndexes: {},
    ignoredIndexes: {},
    elevatedItemIndexes: new Map(),
  });
  const [state, setState] = React.useState<IState>({
    visibleItemIndexes: [],
    elevatedItemIndexes: {},
  });
  const { visibleItemIndexes, elevatedItemIndexes } = state;

  const initCache = () => {
    const currentCache = cache.current;
    /** Size allocated to the verticalPadding and the fixed items that have a custom size specified by the user */
    const extraItemsSize = fixedItemsSize.sum + padding;
    /** Available size on the table container displayable size */
    const scrollableItemsSize = containerSize - extraItemsSize;
    /**
     * contains every items that are not hidden
     */
    const scrollableItemsCount = itemsLength - hiddenItems.length;

    currentCache.visibleFixedItems = stableFixedItems.filter((fixedItem) => !hiddenItems.includes(fixedItem));
    /** the total number of items we have to display inside the table size */
    currentCache.itemsCount =
      itemsCount !== undefined ? itemsCount : Math.floor(scrollableItemsSize / minItemSize + fixedItemsSize.count);
    /** Items size for the items without manual specified size */
    currentCache.itemSize =
      currentCache.itemsCount > 0 ? Math.ceil(scrollableItemsSize / (currentCache.itemsCount - fixedItemsSize.count)) : 0;
    /** The size of the table if all items are displayed */
    currentCache.virtualSize = (scrollableItemsCount - fixedItemsSize.count) * currentCache.itemSize + extraItemsSize;

    currentCache.ignoredIndexes = {};
    [...currentCache.visibleFixedItems, ...hiddenItems].forEach((ignoredIndex) => {
      currentCache.ignoredIndexes[ignoredIndex] = true;
    });

    currentCache.itemIndexesScrollMapping = getIndexScrollMapping(
      itemsLength,
      fixedItemsSize.customSizes,
      currentCache.itemSize,
      hiddenItems
    );
    currentCache.visibleItemIndexes = {};
    currentCache.elevatedItemIndexes = new Map();
  };

  const getVisibleItemIndexes = (scrollValue = 0) => {
    const currentCache = cache.current;
    let fixedItemsCount = currentCache.visibleFixedItems.findIndex(
      (fixedItemIndex) => currentCache.itemIndexesScrollMapping[fixedItemIndex] >= scrollValue
    );
    fixedItemsCount = fixedItemsCount === -1 ? currentCache.visibleFixedItems.length : fixedItemsCount;

    const scrollIndex = Math.round(scrollValue / currentCache.itemSize) + fixedItemsCount;

    if (!currentCache.visibleItemIndexes[scrollIndex]) {
      const itemIndexStart = scrollIndexToGridIndex(scrollIndex, hiddenItems);
      currentCache.visibleItemIndexes[scrollIndex] = addSequentialIndexesToFixedIndexList(
        currentCache.visibleFixedItems,
        itemIndexStart,
        itemsLength,
        currentCache.itemsCount,
        currentCache.ignoredIndexes
      );
      return currentCache.visibleItemIndexes[scrollIndex];
    }

    return currentCache.visibleItemIndexes[scrollIndex];
  };

  const getElevatedItemIndexes = (visibleItemIndexes: number[]): IElevateds => {
    const currentCache = cache.current;
    const elevatedItems = currentCache.elevatedItemIndexes.get(visibleItemIndexes);

    if (!elevatedItems) {
      currentCache.elevatedItemIndexes.set(
        visibleItemIndexes,
        getElevatedIndexes(visibleItemIndexes, currentCache.ignoredIndexes, true)
      );
      return currentCache.elevatedItemIndexes.get(visibleItemIndexes) as IElevateds;
    }
    return elevatedItems as IElevateds;
  };

  const getVisibleItemsState = (scrollValue = 0): IState | null => {
    const newVisibleItemIndexes = getVisibleItemIndexes(scrollValue);
    if (newVisibleItemIndexes !== visibleItemIndexes) {
      return {
        visibleItemIndexes: newVisibleItemIndexes,
        elevatedItemIndexes: getElevatedItemIndexes(newVisibleItemIndexes),
      };
    }
    return null;
  };

  const updateVisibleItems = (scrollValues: IOnScroll) => {
    const { scrollValue } = scrollValues;
    const newItemsState = getVisibleItemsState(scrollValue);

    if (newItemsState) {
      setState(newItemsState);
    }

    if (onScroll) {
      const { visibleItemIndexes } = newItemsState || state;
      const itemsCursor = findFirstNotIncluded(visibleItemIndexes, cache.current.visibleFixedItems);
      onScroll({
        scrollValues,
        newItemsState: newItemsState || state,
        itemsCursor,
      });
    }
  };

  const goToItemIndex = (itemIndex: number): boolean => {
    const toItemIndex = Math.max(Math.min(itemIndex, itemsLength - 1), 0);
    const fixedItemsBeforeItem = cache.current.visibleFixedItems.filter((fixedItemIndex) => fixedItemIndex < toItemIndex).length;
    /** Total size of scrollable items that are placed before the itemIndex we want to scroll on */
    const newScrollValue = cache.current.itemIndexesScrollMapping[toItemIndex - fixedItemsBeforeItem];
    return newScrollValue != null ? scrollTo(newScrollValue) : false;
  };

  React.useEffect(() => {
    if (isInitialized.current) {
      if (initialScroll && initialScroll >= 0) {
        goToItemIndex(initialScroll);
      }
    }
  }, [isInitialized.current]);

  React.useEffect(() => {
    isInitialized.current = true;
  }, []);

  React.useEffect(() => {
    const scrollValue = getScrollValue();
    initCache();
    const newItemsState = getVisibleItemsState(scrollValue || 0) as IState;
    if (newItemsState) {
      setState(newItemsState);
    }
  }, [containerSize, itemsLength, minItemSize, itemsCount, stableFixedItems, stableHiddenItems, padding, getScrollValue]);

  const controller: IVirtualizerController = {
    visibleItemIndexes,
    elevatedItemIndexes,
    virtualSize: cache.current.virtualSize,
    itemSize: cache.current.itemSize,
    itemsCount: cache.current.itemsCount,
    updateVisibleItems,
    goToItemIndex,
  };

  React.useImperativeHandle(ref, () => controller);

  return controller;
}

export default useVirtualizer;

// / <reference lib="es2017.string" />
import * as React from "react";
import { isEqual } from "lodash";

import { IOnScroll, SCROLLBAR_SIZE } from "./scroller";
import {
  addSequentialIndexesToFixedIndexList,
  getElevatedIndexes,
  getVisibleIndexesInsideDatalength,
  IElevateds,
  scrollIndexToGridIndex,
  findFirstNotIncluded,
  getFixedItemsCountBeforeSelectedItemIndex,
  FixedCustomSizesElements,
  getIndexScrollMapping,
} from "./utils/table";
import { MIN_COLUMN_WIDTH } from "./constants";
import { Nullable } from "./typing";
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
  /** A pre-defined horizontal padding of the grid */
  horizontalPadding: number;
  /** Initial scroll postions */
  initialScroll: number;
  getScrollValue?: () => number;
  scrollTo?: (newScrollValue: number) => boolean;
  /** The scroll handler */
  onScroll?: (props: OnScrollProps) => void;
}

export interface IVirtualizerProps extends IVirtualizerOptionalProps {
  /**  The size of the visible window */
  containerSize: number;
  /** Number of items of the child element */
  itemsLength: number;
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
}

function useVirtualizer(props: IVirtualizerProps): {
  virtualSize: number;
  onScrollerScroll: (scrollValues: IOnScroll) => void;
  itemSize: number;
  visibleItemIndexes: number[];
  elevatedItemIndexes: IElevateds;
} {
  const {
    containerSize,
    itemsLength,
    itemsCount,
    minItemSize = MIN_COLUMN_WIDTH,
    fixedItems,
    hiddenItems,
    fixedItemsSize,
    horizontalPadding,
    initialScroll,
    getScrollValue,
    scrollTo,
    onScroll,
  } = props;
  const stableFixedItems = useStableValue(fixedItems);
  const stableHiddenItems = useStableValue(hiddenItems);

  const cache = React.useRef<VirtualizerCache>({
    itemsCount: 0,
    itemSize: 0,
    visibleFixedItems: [],
    virtualSize: 0,
    itemIndexesScrollMapping: [],
    visibleItemIndexes: {},
  });
  const [state, setState] = React.useState<IState>({
    visibleItemIndexes: [],
    elevatedItemIndexes: {},
  });
  const { visibleItemIndexes, elevatedItemIndexes } = state;

  const initCache = () => {
    const currentCache = cache.current;
    /** Size allocated to the verticalPadding and the fixed items that have a custom size specified by the user */
    let extraItemsSize = fixedItemsSize.sum + horizontalPadding;
    /** Available size on the table container displayable size */
    let scrollableItemsSize = containerSize - extraItemsSize;
    currentCache.visibleFixedItems = stableFixedItems.filter((fixedItem) => !hiddenItems.includes(fixedItem));
    /**
     * contains every items that are not hidden
     */
    const scrollableItemsCount = itemsLength - hiddenItems.length;
    /** the total number of items we have to display inside the table size */
    currentCache.itemsCount =
      itemsCount !== undefined ? itemsCount : Math.floor(scrollableItemsSize / minItemSize + fixedItemsSize.count);

    if (currentCache.itemsCount < itemsLength) {
      scrollableItemsSize = scrollableItemsSize - SCROLLBAR_SIZE;
      extraItemsSize = extraItemsSize + SCROLLBAR_SIZE;
      /** the total number of items we have to display inside the table size */
      currentCache.itemsCount =
        itemsCount !== undefined ? itemsCount : Math.floor(scrollableItemsSize / minItemSize + fixedItemsSize.count);
    }

    /** Items size for the items without manual specified size */
    currentCache.itemSize =
      currentCache.itemsCount > 0 ? Math.ceil(scrollableItemsSize / (currentCache.itemsCount - fixedItemsSize.count)) : 0;
    /** The size of the table if all items are displayed */
    currentCache.virtualSize = (scrollableItemsCount - fixedItemsSize.count) * currentCache.itemSize + extraItemsSize;
    currentCache.itemIndexesScrollMapping = getIndexScrollMapping(
      itemsLength,
      fixedItemsSize.customSizes,
      currentCache.itemSize,
      hiddenItems
    );
    currentCache.visibleItemIndexes = {};
  };

  const getVisibleItemIndexes = (scrollLeft = 0) => {
    const currentCache = cache.current;
    let fixedItemsCount = stableFixedItems.findIndex((r) => currentCache.itemIndexesScrollMapping[r] >= scrollLeft);
    fixedItemsCount = fixedItemsCount === -1 ? stableFixedItems.length : fixedItemsCount;
    const scrollIndex = Math.round(scrollLeft / currentCache.itemSize) + fixedItemsCount;
    const itemIndexStart = scrollIndexToGridIndex(scrollIndex, hiddenItems);

    if (!currentCache.visibleItemIndexes[itemIndexStart]) {
      currentCache.visibleItemIndexes[itemIndexStart] = addSequentialIndexesToFixedIndexList(
        currentCache.visibleFixedItems,
        itemIndexStart,
        itemsLength,
        currentCache.itemsCount,
        hiddenItems
      );
      return currentCache.visibleItemIndexes[itemIndexStart];
    }

    return currentCache.visibleItemIndexes[itemIndexStart];
  };

  const getElevatedItemIndexes = (visibleItemIndexes: number[]): IElevateds => {
    const newElevatedItemIndexes = getElevatedIndexes(visibleItemIndexes, stableFixedItems, true);
    if (!isEqual(elevatedItemIndexes, newElevatedItemIndexes)) {
      return newElevatedItemIndexes;
    }
    return elevatedItemIndexes;
  };

  const getVisibleItemsState = (scrollLeft = 0): IState | null => {
    const newVisibleItemIndexes = getVisibleItemIndexes(scrollLeft);
    if (!isEqual(newVisibleItemIndexes, visibleItemIndexes)) {
      return {
        visibleItemIndexes: newVisibleItemIndexes,
        elevatedItemIndexes: getElevatedItemIndexes(newVisibleItemIndexes),
      };
    }
    return null;
  };

  const onScrollerScroll = (scrollValues: IOnScroll) => {
    const { scrollLeft } = scrollValues;
    const newItemsState = getVisibleItemsState(scrollLeft);

    if (newItemsState) {
      setState(newItemsState);
    }

    if (onScroll) {
      const { visibleItemIndexes } = newItemsState || state;
      const itemsCursor = findFirstNotIncluded(visibleItemIndexes, cache.current.visibleFixedItems);
      onScroll({
        scrollValues,
        newItemsState,
        itemsCursor,
      });
    }
  };

  const scrollToItemIndex = (itemIndex: number): boolean => {
    if (scrollTo) {
      const sizes = fixedItemsSize?.customSizes ?? {};
      const nbOfHiddenIndexesBeforeStartIndex = hiddenItems.filter((hiddenIndex) => hiddenIndex <= itemIndex).length;
      const beforeFixedItemsCount = getFixedItemsCountBeforeSelectedItemIndex(fixedItems, itemIndex);
      const selectedItemSize = sizes[itemIndex] ?? cache.current.itemSize;
      /** Total size of scrollable items that are placed before the itemIndex we want to scroll on */
      const scrollableItemsTotalSize =
        (itemIndex - 1 - beforeFixedItemsCount - nbOfHiddenIndexesBeforeStartIndex) * cache.current.itemSize;
      const newScrollValue = selectedItemSize + scrollableItemsTotalSize;

      return newScrollValue != null ? scrollTo(newScrollValue) : false;
    }
    return false;
  };

  React.useEffect(() => {
    initCache();
    const initalVisibleItemIndexes = getVisibleItemIndexes();
    const newState = {
      visibleItemIndexes: initalVisibleItemIndexes,
      elevatedItemIndexes: getElevatedItemIndexes(initalVisibleItemIndexes),
    };
    setState(newState);
    if (initialScroll && initialScroll >= 0) {
      scrollToItemIndex(initialScroll);
    }
  }, []);

  React.useEffect(() => {
    if (getScrollValue) {
      initCache();
      const scrollValue = getScrollValue();
      const newItemsState = getVisibleItemsState(scrollValue) as IState;
      setState(newItemsState);
    }
  }, [containerSize, itemsLength, minItemSize, itemsCount, stableFixedItems, stableHiddenItems, getScrollValue]);

  return {
    virtualSize: cache.current.virtualSize,
    onScrollerScroll,
    itemSize: cache.current.itemSize,
    visibleItemIndexes: getVisibleIndexesInsideDatalength(itemsLength, visibleItemIndexes),
    elevatedItemIndexes,
  };
}

export default useVirtualizer;


import * as React from "react";
import { isEqual } from "lodash";

import {
    addSequentialIndexesToFixedIndexList,
    getVisibleIndexesInsideDatalength,
    scrollIndexToGridIndex,
    findFirstNotIncluded
} from "./utils/table";
import { MIN_COLUMN_WIDTH, BORDER_SIZE } from "./constants";
import { Nullable } from ".";

export interface OnScrollProps {
    newScrollCursor: number;
    newItemIndex: number;
    newVisibleItemsState: Nullable<number[]>;
}

export interface IVirtualizerOptionalProps {
    /** List of fixed columns on the left or right of your table */
    fixedItemsIndexes?: number[];
    /** Number of columns that should be visible on screen */
    visibleItemsCount?: number;
    /** Minimal height of a row */
    minItemSize?: number;
    /** Sum of the width of fixed columns with a pre-defined width */
    fixedItemsProps?: {
        sum: number;
        count: number;
    };
    /** A pre-defined horizontal padding of the grid */
    padding?: number;
    /** The scroll handler */
    onScroll?: (props: OnScrollProps) => void;
    currentScrollCursor?: number;
    /** Specifies indexes of the columns to be shown */
    hiddenItemsIndexes?: number[];
}

export interface IVirtualizerProps extends IVirtualizerOptionalProps {
    /**  The width of the visible window */
    size: number;
    /** Number of columns of the child element */
    totalItemsCount: number;
}

export interface IComputedVirtualizerProps {
    visibleFixedItemsIndexes: number[],
    visibleItemsCount: number,
    itemSize: number,
    size: number,
    virtualSize: number
}

export interface IUseVirtualizer {
    scrollTo: (newCursor: number) => void,
    itemIndexToScrollCursor: (itemIndex: number) => number,
    visibleItemsIndexes?: number[];
    virtualizerProps?: IComputedVirtualizerProps;
}

const defaultList: number[] = []

const useVirtualizer = ({
    size,
    minItemSize,
    padding = 0,
    currentScrollCursor,
    onScroll,
    totalItemsCount,
    visibleItemsCount,
    hiddenItemsIndexes = defaultList,
    fixedItemsProps = {
        sum: 0,
        count: 0
    },
    fixedItemsIndexes = defaultList }: IVirtualizerProps): IUseVirtualizer => {
    const getVirtualizerProps = (): IComputedVirtualizerProps => {
        const virtualizerProps: IComputedVirtualizerProps = {
            visibleFixedItemsIndexes: [],
            visibleItemsCount: 0,
            itemSize: 0,
            size: 0,
            virtualSize: 0
        }
        const defaultMinItemSize = minItemSize || MIN_COLUMN_WIDTH;
        const extraCellsSize = fixedItemsProps.sum + padding;
        const scrollableColumnsSize = size - extraCellsSize;

        virtualizerProps.visibleFixedItemsIndexes = fixedItemsIndexes.filter(fixedItemIndex => !hiddenItemsIndexes.includes(fixedItemIndex));

        const scrollableItemsCount = totalItemsCount - fixedItemsProps.count - hiddenItemsIndexes.length + virtualizerProps.visibleFixedItemsIndexes.length;

        virtualizerProps.visibleItemsCount =
            visibleItemsCount !== undefined ? visibleItemsCount : Math.floor(scrollableColumnsSize / defaultMinItemSize + fixedItemsProps.count);

        virtualizerProps.itemSize = virtualizerProps.visibleItemsCount ? Math.ceil(scrollableColumnsSize / (virtualizerProps.visibleItemsCount - fixedItemsProps.count)) : 0;

        virtualizerProps.size =
            virtualizerProps.itemSize * (virtualizerProps.visibleItemsCount - fixedItemsProps.count) - virtualizerProps.visibleItemsCount * BORDER_SIZE + extraCellsSize;
        virtualizerProps.virtualSize = scrollableItemsCount * virtualizerProps.itemSize + extraCellsSize;
        return virtualizerProps
    };

    const virtualizerProps = React.useRef<IComputedVirtualizerProps>(getVirtualizerProps())
    const [visibleItemsIndexes, setVisibleItemsIndexes] = React.useState<number[]>([])

    React.useEffect(() => {
        virtualizerProps.current = getVirtualizerProps()
        const newVisibleItemsState = getVisibleItemsState(currentScrollCursor) || [];
        setVisibleItemsIndexes(newVisibleItemsState)
    }, [size, totalItemsCount, minItemSize, visibleItemsCount, fixedItemsIndexes, hiddenItemsIndexes])

    const itemIndexToScrollCursor = (itemIndex: number): number => {
        const nbOfHiddenIndexesBeforeStartIndex = hiddenItemsIndexes.filter(hiddenIndex => hiddenIndex <= itemIndex).length;
        return virtualizerProps.current.itemSize * (itemIndex - nbOfHiddenIndexesBeforeStartIndex) + virtualizerProps.current.itemSize / 2;
    };

    const getVisibleItemsIndexes = React.useCallback((cursor = 0): number[] => {
        const scrollIndex = Math.floor(cursor / virtualizerProps.current.itemSize);
        const columnIndexStart = scrollIndexToGridIndex(scrollIndex, hiddenItemsIndexes);
        return addSequentialIndexesToFixedIndexList(
            virtualizerProps.current.visibleFixedItemsIndexes,
            columnIndexStart,
            totalItemsCount,
            virtualizerProps.current.visibleItemsCount,
            hiddenItemsIndexes
        );
    }, [virtualizerProps.current]);

    const getVisibleItemsState = React.useCallback((cursor = 0): number[] | null => {
        const newVisibleItemsIndexes = getVisibleItemsIndexes(cursor);
        let columnState = null;
        if (!isEqual(newVisibleItemsIndexes, visibleItemsIndexes)) {
            columnState = newVisibleItemsIndexes
        }
        return columnState;
    }, [visibleItemsIndexes, getVisibleItemsIndexes]);

    const scrollTo = React.useCallback((newScrollCursor: number): void => {
        const newVisibleItemsState = currentScrollCursor !== newScrollCursor ? getVisibleItemsState(newScrollCursor) : null;
        if (newVisibleItemsState && !isEqual(newVisibleItemsState, visibleItemsIndexes)) {
            setVisibleItemsIndexes(newVisibleItemsState)
            const newItemIndex = findFirstNotIncluded(newVisibleItemsState, virtualizerProps.current.visibleFixedItemsIndexes);
            if (onScroll) {
                onScroll({ newScrollCursor, newVisibleItemsState, newItemIndex });
            }
        }
    }, [getVisibleItemsState]);

    return {
        scrollTo,
        itemIndexToScrollCursor,
        visibleItemsIndexes: getVisibleIndexesInsideDatalength(totalItemsCount, visibleItemsIndexes),
        virtualizerProps: virtualizerProps.current
    }
}

export default useVirtualizer;

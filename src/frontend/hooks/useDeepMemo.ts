import * as React from 'react';
import isEqual from 'react-fast-compare';

export const useDeepMemo = <T>(value: T): T => {
    const [memoizedValue, setMemoizedValue] = React.useState(value);
    if (!isEqual(value, memoizedValue)) {
        setMemoizedValue(value);
    }
    return memoizedValue;
};

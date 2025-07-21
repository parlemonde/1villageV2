import isEqual from 'fast-deep-equal/es6';
import * as React from 'react';

export const useDeepMemo = <T>(value: T): T => {
    const [memoizedValue, setMemoizedValue] = React.useState(value);
    if (!isEqual(value, memoizedValue)) {
        setMemoizedValue(value);
    }
    return memoizedValue;
};

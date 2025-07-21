export function serializeToQueryUrl(obj: { [key: string]: unknown }) {
    const queryStrings = Object.keys(obj).reduce<string[]>(function (a, k) {
        const value = obj[k];
        if (value === undefined || value === null) {
            return a;
        }
        if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
            a.push(k + '=' + encodeURIComponent(value));
        }
        if (Array.isArray(value) && value.every((s) => typeof s === 'string')) {
            a.push(k + '=' + encodeURIComponent(value.join(',')));
        }
        return a;
    }, []);

    if (queryStrings.length === 0) {
        return '';
    }
    return `?${queryStrings.join('&')}`;
}

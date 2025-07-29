export function getStringValue(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }
    return '';
}

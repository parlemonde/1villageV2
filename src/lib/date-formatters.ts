export const toFormattedDate = (date: string | null): string => {
    return date ? Intl.DateTimeFormat('fr', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(date)) : '';
};

export const toFormattedDatetime = (date: string | null): string => {
    return date
        ? Intl.DateTimeFormat('fr', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
        : '';
};

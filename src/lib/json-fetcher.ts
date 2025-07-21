export async function jsonFetcher<T>(input: string | URL | globalThis.Request, init?: RequestInit): Promise<T> {
    return fetch(input, init).then((res) => res.json());
}

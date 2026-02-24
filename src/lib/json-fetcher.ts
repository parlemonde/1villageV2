export async function jsonFetcher<T = unknown>(input: string | URL | globalThis.Request, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }

    return res.json() as Promise<T>;
}

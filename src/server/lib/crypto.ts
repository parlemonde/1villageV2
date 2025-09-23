const encoder = new TextEncoder();

export async function hmac(key: string | ArrayBuffer, string: string) {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        typeof key === 'string' ? encoder.encode(key) : key,
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['sign'],
    );
    return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(string));
}
const HEX_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
export function buf2hex(arrayBuffer: ArrayBuffer) {
    const buffer = new Uint8Array(arrayBuffer);
    let out = '';
    for (let idx = 0; idx < buffer.length; idx++) {
        const n = buffer[idx];
        out += HEX_CHARS[(n >>> 4) & 0xf];
        out += HEX_CHARS[n & 0xf];
    }
    return out;
}

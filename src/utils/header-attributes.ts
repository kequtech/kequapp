import type { Params } from '../types.ts';

export function headerAttributes(header = ''): Params {
    const result: Params = {};
    if (!header) return result;
    const parts = header.split(';');
    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue; // skip things like "multipart/form-data" or "form-data"
        const key = trimmed.slice(0, eq).trim();
        if (!key) continue;
        let value = trimmed.slice(eq + 1).trim();
        if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
            value = value.slice(1, -1);
        }
        result[key] = value;
    }
    return result;
}

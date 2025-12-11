import { Ex } from '../../ex.ts';
import type { Params, RawPart } from '../../types.ts';

const CR = 0x0d;
const LF = 0x0a;

export function splitMultipart(body: RawPart): RawPart[] {
    const contentType = body.headers['content-type'];

    if (!contentType?.toLowerCase().startsWith('multipart/')) {
        throw Ex.BadRequest('Unable to process request', {
            contentType,
        });
    }

    const boundary = extractBoundary(contentType);
    const buffer = body.data;
    const result: RawPart[] = [];

    let headers: Params = {};
    const firstBoundary = buffer.indexOf(boundary);
    if (firstBoundary === -1) {
        throw Ex.BadRequest('Multipart body missing boundary marker', { boundary });
    }
    let i = findNextLine(buffer, firstBoundary);

    function addHeader(nextLine: number) {
        const line = buffer.toString('utf8', i, nextLine);
        const parts = line.split(':');
        const key = parts[0].trim().toLowerCase();
        const value = parts[1]?.trim();
        if (key && value) headers[key] = value;
    }

    function addPart(nextBoundary: number) {
        const dataEnd = nextBoundary - (buffer[nextBoundary - 2] === CR ? 2 : 1);
        result.push({
            headers,
            data: buffer.subarray(i, dataEnd),
        });
        headers = {};
    }

    while (i > -1) {
        // until two new lines
        while (i > -1 && i < buffer.length && buffer[i] !== CR && buffer[i] !== LF) {
            const nextLine = findNextLine(buffer, i);
            if (nextLine > -1) addHeader(nextLine);

            i = nextLine;
        }

        if (i < 0) break;
        i += buffer[i] === CR ? 2 : 1;
        if (i >= buffer.length) break;

        // data start
        const nextBoundary = buffer.indexOf(boundary, i);
        if (nextBoundary < 0) break;
        addPart(nextBoundary);

        i = findNextLine(buffer, nextBoundary);
    }

    return result;
}

function extractBoundary(contentType: string) {
    // handle: multipart/form-data; boundary=foo
    //         multipart/form-data; boundary="foo"
    const match = /;\s*boundary="?([^";]+)"?/i.exec(contentType);
    if (!match) {
        throw Ex.BadRequest('Multipart request requires boundary attribute', {
            contentType,
        });
    }
    return `--${match[1]}`;
}

function findNextLine(buffer: Buffer, from: number) {
    if (from < 0 || from >= buffer.length) return -1;
    const lf = buffer.indexOf(LF, from);
    if (lf === -1 || lf + 1 >= buffer.length) return -1;
    return lf + 1;
}

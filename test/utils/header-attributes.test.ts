import assert from 'node:assert/strict';
import { it } from 'node:test';
import { headerAttributes } from '../../src/utils/header-attributes.ts';

it('parses standard content-type attributes', () => {
    const result = headerAttributes('multipart/form-data; boundary=boundary1; name=name1');
    assert.deepEqual(result, {
        boundary: 'boundary1',
        name: 'name1',
    });
});

it('parses quoted attributes', () => {
    const result = headerAttributes('multipart/form-data; boundary="boundary1"; name="name1"');
    assert.deepEqual(result, {
        boundary: 'boundary1',
        name: 'name1',
    });
});

it('parses generic attributes', () => {
    const result = headerAttributes('foo=bar; hello="there"; baz=qux');
    assert.deepEqual(result, {
        foo: 'bar',
        hello: 'there',
        baz: 'qux',
    });
});

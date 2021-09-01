import * as assert from 'assert';

import * as httputil from '../../util/http';

suite('Util Test Suite', () => {
	test('parseContentType', () => {
		let contentType = 'text/html; charset=utf8';
		let parsed = httputil.parseContentType(contentType);
		assert.strictEqual(parsed?.mime, 'text/html');
		assert.strictEqual(parsed?.charset, 'utf8');
	});
});

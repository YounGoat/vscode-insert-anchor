/**
 * 与 HTTP 请求及响应相关的小功能。
 * @author jiangjing.shanghai@bytedance.com
 * @create 2021-09-01
 */

interface ContentType {
	boundary?: string
	charset?: string
	mime: string
}

export function parseContentType(contentType : string | null): ContentType | null {
	if (!contentType) {
		return null;
	}

	let [ mime, ext ] = contentType.toLowerCase().split(/;\s*/);
	let boundary, charset, matched;
	if (ext && (matched = ext.match(/^(boundary|charset)=(.+)$/))) {
		let [ , name, value ] = matched;
		if (name === 'boundary') {
			boundary = value;
		}
		if (name === 'charset') {
			charset = value; }
	}
	return { boundary, charset, mime };
}
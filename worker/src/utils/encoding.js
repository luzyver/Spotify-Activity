export function base64ToUtf8(base64Str) {
	const cleanBase64 = base64Str.replace(/\s/g, '');

	const binaryString = atob(cleanBase64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

export function utf8ToBase64(str) {
	const encoder = new TextEncoder();
	const utf8Bytes = encoder.encode(str);
	const binaryString = Array.from(utf8Bytes)
		.map(byte => String.fromCharCode(byte))
		.join('');
	return btoa(binaryString);
}

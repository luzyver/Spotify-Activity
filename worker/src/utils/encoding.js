export function base64ToUtf8(base64Str) {
	const cleanBase64 = base64Str.replace(/\s/g, '');
	const binaryString = atob(cleanBase64);
	const bytes = new Uint8Array(binaryString.length);

	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	return new TextDecoder('utf-8').decode(bytes);
}

export function utf8ToBase64(str) {
	const bytes = new TextEncoder().encode(str);
	const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
	return btoa(binaryString);
}

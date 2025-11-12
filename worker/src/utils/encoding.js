/**
 * Encoding Utilities
 * Handles UTF-8 and Base64 encoding/decoding
 */

/**
 * Decode base64 string to UTF-8 string properly
 * @param {string} base64Str - Base64 encoded string
 * @returns {string} UTF-8 decoded string
 */
export function base64ToUtf8(base64Str) {
	// Remove whitespace and newlines that GitHub might add
	const cleanBase64 = base64Str.replace(/\s/g, '');

	// Decode base64 to binary string
	const binaryString = atob(cleanBase64);

	// Convert binary string to Uint8Array
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	// Decode UTF-8 bytes to string
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

/**
 * Encode UTF-8 string to base64 properly
 * This handles Unicode characters correctly for GitHub API
 * @param {string} str - UTF-8 string to encode
 * @returns {string} Base64 encoded string
 */
export function utf8ToBase64(str) {
	// Use TextEncoder to properly convert UTF-8 string to bytes
	const encoder = new TextEncoder();
	const utf8Bytes = encoder.encode(str);

	// Convert bytes array to binary string
	const binaryString = Array.from(utf8Bytes)
		.map(byte => String.fromCharCode(byte))
		.join('');

	// Encode to base64
	return btoa(binaryString);
}

/**
 * Fix double-encoded UTF-8 strings (mojibake)
 * @param {string} str - String that might be double-encoded
 * @returns {string} Fixed string or original if no fix needed
 */
export function fixDoubleEncoding(str) {
	if (!str) return str;

	try {
		// Strategy: Try to decode as Latin-1 bytes -> UTF-8
		// If result is "better" (more valid UTF-8), use it
		const decoder = new TextDecoder('utf-8');

		// Convert string treating each character as Latin-1 byte
		const bytes = [];
		for (let i = 0; i < str.length; i++) {
			bytes.push(str.charCodeAt(i) & 0xFF);
		}

		// Try to decode as UTF-8
		const fixed = decoder.decode(new Uint8Array(bytes));

		// Check if fixed version is "better" than original
		if (fixed === str) return str; // No change

		// Count high-ASCII characters (potential mojibake indicators)
		const countHighAscii = (s) => {
			let count = 0;
			for (let i = 0; i < s.length; i++) {
				const code = s.charCodeAt(i);
				if (code >= 0x80 && code <= 0xFF) count++;
			}
			return count;
		};

		const originalHighAscii = countHighAscii(str);
		const fixedHighAscii = countHighAscii(fixed);

		// If fixed version has no replacement chars and fewer high-ASCII chars, it's likely correct
		if (!fixed.includes('\uFFFD') && fixedHighAscii < originalHighAscii) {
			return fixed;
		}
	} catch (e) {
		console.error('Error fixing encoding:', e.message);
	}

	return str;
}

export const getExternalUrl = (text: string): string | null => {
	const value = text.trim();
	if (!value || /\s/.test(value)) return null;

	try {
		const url = new URL(value);
		if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

		return url.href;
	} catch {
		return null;
	}
};

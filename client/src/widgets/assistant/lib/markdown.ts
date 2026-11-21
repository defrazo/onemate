export const safeMarkdownUrl = (value: string) => {
	try {
		const url = new URL(value, 'https://onemate.invalid');
		return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? value : '';
	} catch {
		return '';
	}
};

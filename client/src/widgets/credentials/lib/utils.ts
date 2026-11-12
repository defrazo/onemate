export const normalizeUrl = (value: string) => {
	const url = value.trim();
	if (!url) return '';

	if (/^https?:\/\//i.test(url)) return url;

	return `https://${url}`;
};

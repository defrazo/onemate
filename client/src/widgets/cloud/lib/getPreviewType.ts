export type PreviewType = 'image' | 'text' | 'pdf' | null;

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']);

/* prettier-ignore */
const TEXT_EXTENSIONS = new Set([
	'txt', 'md', 'json', 'csv', 'log', 'xml', 'yaml', 'yml',
	'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'htm', 'sql',
	'env', 'ini', 'conf', 'sh', 'py', 'php',
]);

export const getPreviewType = (name: string, mimeType: string): PreviewType => {
	const extension = name.split('.').pop()?.toLowerCase() ?? '';
	const mime = mimeType.toLowerCase().split(';')[0].trim();

	if (IMAGE_EXTENSIONS.has(extension) && mime.startsWith('image/')) return 'image';

	if (extension === 'pdf' && mime === 'application/pdf') return 'pdf';

	if (TEXT_EXTENSIONS.has(extension) || (mime.startsWith('text/') && extension !== 'svg')) return 'text';

	return null;
};

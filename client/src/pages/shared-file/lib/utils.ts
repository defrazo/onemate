type PreviewType = 'image' | 'pdf' | 'text' | null;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

export const getPreviewType = (mimeType: string | null): PreviewType => {
	if (!mimeType) return null;

	if (IMAGE_TYPES.includes(mimeType)) return 'image';
	if (mimeType === 'application/pdf') return 'pdf';
	if (mimeType === 'text/plain') return 'text';

	return null;
};

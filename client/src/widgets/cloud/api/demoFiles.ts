import type { CloudFile } from '../model';

export const CLOUD_DEMO_FILES: CloudFile[] = [
	{
		id: 'demo-welcome',
		name: 'welcome.txt',
		mimeType: 'text/plain',
		size: 0,
		createdAt: '2026-10-01T12:00:00.000Z',
		isFavorite: false,
		publicUrl: null,
	},
	{
		id: 'demo-guide',
		name: 'guide.pdf',
		mimeType: 'application/pdf',
		size: 0,
		createdAt: '2026-10-02T12:00:00.000Z',
		isFavorite: false,
		publicUrl: null,
	},
	{
		id: 'demo-landscape',
		name: 'landscape.webp',
		mimeType: 'image/webp',
		size: 0,
		createdAt: '2026-10-03T12:00:00.000Z',
		isFavorite: false,
		publicUrl: null,
	},
];

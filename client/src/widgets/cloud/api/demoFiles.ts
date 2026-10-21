import type { CloudFile } from '../model';

export const CLOUD_DEMO_FILES: CloudFile[] = [
	{
		id: 'demo-welcome',
		name: 'welcome.txt',
		mimeType: 'text/plain',
		size: 677,
		createdAt: '2026-10-04T12:00:00.000Z',
		isFavorite: false,
		publicUrl: null,
	},
	{
		id: 'demo-guide',
		name: 'guide.pdf',
		mimeType: 'application/pdf',
		size: 49545,
		createdAt: '2026-10-03T12:00:00.000Z',
		isFavorite: true,
		publicUrl: null,
	},
	{
		id: 'demo-json',
		name: 'sample.json',
		mimeType: 'application/json',
		size: 817,
		createdAt: '2026-10-02T12:00:00.000Z',
		isFavorite: false,
		publicUrl: null,
	},
	{
		id: 'demo-landscape',
		name: 'landscape.webp',
		mimeType: 'image/webp',
		size: 101980,
		createdAt: '2026-10-05T12:00:00.000Z',
		isFavorite: false,
		publicUrl: null,
	},
	{
		id: 'demo-city',
		name: 'city.jpg',
		mimeType: 'image/webp',
		size: 96372,
		createdAt: '2026-10-01T12:00:00.000Z',
		isFavorite: true,
		publicUrl: null,
	},
];

export const DEMO_FILE_PATHS: Record<string, string> = {
	'demo-welcome': '/demo/cloud/welcome.txt',
	'demo-guide': '/demo/cloud/guide.pdf',
	'demo-json': '/demo/cloud/sample.json',
	'demo-landscape': '/demo/cloud/landscape.webp',
	'demo-city': '/demo/cloud/city.jpg',
};

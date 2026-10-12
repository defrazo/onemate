import type { SharedFile } from '../model';

export class SharedFileNotFoundError extends Error {
	constructor() {
		super('Файл не найден');
	}
}

export const getSharedFile = async (token: string, signal?: AbortSignal): Promise<SharedFile> => {
	const response = await fetch(`/api/cloud/shared/${encodeURIComponent(token)}`, { signal });

	if (response.status === 404) throw new SharedFileNotFoundError();

	if (!response.ok) throw new Error('Не удалось загрузить файл');

	return (await response.json()) as SharedFile;
};

export const getSharedFilePreviewUrl = (token: string) => `/api/cloud/shared/${encodeURIComponent(token)}/preview`;

export const getSharedFileDownloadUrl = (token: string) => `/api/cloud/shared/${encodeURIComponent(token)}/download`;

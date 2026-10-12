export type CloudTab = 'files' | 'text';

export interface CloudFile {
	id: string;
	name: string;
	size: number;
	mimeType: string;
	createdAt: string;
	publicUrl: string | null;
	isFavorite: boolean;
}

export interface CloudData {
	files: CloudFile[];
	usedBytes: number;
	quotaBytes: number;
	text: string;
	textRevision: number;
}

export type CloudSort = 'newest' | 'oldest' | 'name' | 'size';

export interface CloudFilePatch {
	name?: string;
	isFavorite?: boolean;
}

export interface CloudTextData {
	text: string;
	revision: number;
}

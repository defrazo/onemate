import type { CloudData, CloudFilePatch, CloudTextData, UploadProgress } from '.';

export interface ICloudRepo {
	load(): Promise<CloudData>;
	getPreview(id: string): Promise<Blob>;
	upload(file: File, onProgress: (percent: UploadProgress) => void): Promise<void>;
	download(id: string, filename: string): Promise<void>;
	update(id: string, patch: CloudFilePatch): Promise<void>;
	delete(id: string): Promise<void>;
	deleteMany(ids: string[]): Promise<void>;
	share(id: string): Promise<string>;
	unshare(id: string): Promise<void>;
	loadText(): Promise<CloudTextData>;
	saveText(text: string, revision: number): Promise<CloudTextData>;
}

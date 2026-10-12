import { api } from '@/shared/api';

import type { CloudData, CloudFilePatch, CloudTextData, ICloudRepo } from '../../model';

export class CloudRepoLaravel implements ICloudRepo {
	async load(): Promise<CloudData> {
		const { data } = await api.get<CloudData>('/cloud');
		return data;
	}

	async upload(file: File, onProgress: (percent: number) => void): Promise<void> {
		const formData = new FormData();
		formData.append('file', file);

		await api.post('/cloud/files', formData, {
			onUploadProgress: (event) => {
				if (!event.total) return;

				onProgress(Math.round((event.loaded / event.total) * 100));
			},
		});
	}

	async getPreview(id: string): Promise<Blob> {
		const { data } = await api.get<Blob>(`/cloud/files/${id}/download`, { responseType: 'blob' });
		return data;
	}

	async download(id: string, filename: string): Promise<void> {
		const blob = await this.getPreview(id);
		const url = URL.createObjectURL(blob);

		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = filename;
		anchor.click();

		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

	async update(id: string, patch: CloudFilePatch): Promise<void> {
		await api.patch(`/cloud/files/${id}`, patch);
	}

	async delete(id: string): Promise<void> {
		await api.delete(`/cloud/files/${id}`);
	}

	async share(id: string): Promise<string> {
		const { data } = await api.post<{ url: string }>(`/cloud/files/${id}/share`);
		return data.url;
	}

	async unshare(id: string): Promise<void> {
		await api.delete(`/cloud/files/${id}/share`);
	}

	async loadText(): Promise<CloudTextData> {
		const { data } = await api.get<CloudTextData>('/cloud/text');
		return data;
	}

	async saveText(text: string, revision: number): Promise<CloudTextData> {
		const { data } = await api.put<CloudTextData>('/cloud/text', { text, revision });
		return data;
	}
}

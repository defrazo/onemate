import { api } from '@/shared/api';

import type { CloudData, CloudFilePatch, CloudTextData, ICloudRepo, UploadProgress } from '../../model';

export class CloudRepoLaravel implements ICloudRepo {
	async load(): Promise<CloudData> {
		const { data } = await api.get<CloudData>('/cloud');
		return data;
	}

	async upload(file: File, onProgress: (progress: UploadProgress) => void, signal?: AbortSignal): Promise<void> {
		const formData = new FormData();
		formData.append('file', file);

		await api.post('/cloud/files', formData, {
			timeout: 0,
			signal,
			onUploadProgress: (event) => {
				onProgress({
					percent: event.total ? Math.round((event.loaded / event.total) * 100) : 0,
					loaded: Math.min(event.loaded, file.size),
					speed: event.rate ?? 0,
					remaining: event.estimated ?? null,
				});
			},
		});
	}

	async getPreview(id: string): Promise<Blob> {
		const { data } = await api.get<Blob>(`/cloud/files/${id}/download`, { responseType: 'blob' });
		return data;
	}

	async download(id: string): Promise<void> {
		const anchor = document.createElement('a');
		anchor.href = `/cloud/files/${encodeURIComponent(id)}/download`;

		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	}

	async downloadMany(ids: string[]): Promise<void> {
		const response = await fetch('/cloud/csrf-token', {
			credentials: 'same-origin',
			headers: { Accept: 'application/json' },
		});

		if (!response.ok) throw new Error('Не удалось подготовить скачивание');

		const { token } = (await response.json()) as { token: string };

		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/cloud/files/archive';
		form.style.display = 'none';

		const addField = (name: string, value: string) => {
			const input = document.createElement('input');

			input.type = 'hidden';
			input.name = name;
			input.value = value;

			form.appendChild(input);
		};

		addField('_token', token);

		for (const id of ids) addField('ids[]', id);

		document.body.appendChild(form);
		form.submit();
		form.remove();
	}

	async update(id: string, patch: CloudFilePatch): Promise<void> {
		await api.patch(`/cloud/files/${id}`, patch);
	}

	async delete(id: string): Promise<void> {
		await api.delete(`/cloud/files/${id}`);
	}

	async deleteMany(ids: string[]): Promise<void> {
		await api.delete('/cloud/files', { data: { ids } });
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

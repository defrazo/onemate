import type { User } from '@/entities/user';
import { storage } from '@/shared/lib/storage';
import { key } from '@/shared/lib/utils';

import { CLOUD_STORAGE_BYTES, type CloudData, type CloudTextData, type ICloudRepo } from '../../model';
import { CLOUD_DEMO_FILES } from '..';

const DEMO_FILE_PATHS: Record<string, string> = {
	'demo-welcome': '/demo/cloud/welcome.txt',
	'demo-guide': '/demo/cloud/guide.pdf',
	'demo-landscape': '/demo/cloud/landscape.webp',
};

export class CloudRepoDemo implements ICloudRepo {
	constructor(private readonly getCurrentUser: () => User | null) {}

	async load(): Promise<CloudData> {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Нет активного пользователя');

		const clipboard = await this.loadText();

		return {
			files: CLOUD_DEMO_FILES,
			usedBytes: CLOUD_DEMO_FILES.reduce((sum, file) => sum + file.size, 0),
			quotaBytes: CLOUD_STORAGE_BYTES,
			text: clipboard.text,
			textRevision: clipboard.revision,
		};
	}

	async getPreview(id: string): Promise<Blob> {
		const path = DEMO_FILE_PATHS[id];
		if (!path) throw new Error('Файл не найден');

		const response = await fetch(path);
		if (!response.ok) throw new Error('Не удалось загрузить файл');

		return response.blob();
	}

	async upload(): Promise<void> {
		throw new Error('Загрузка файлов недоступна в демо-версии');
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

	async update(): Promise<void> {
		throw new Error('Изменение файлов недоступно в демо-версии');
	}

	async delete(): Promise<void> {
		throw new Error('Удаление файлов недоступно в демо-версии');
	}

	async share(): Promise<string> {
		throw new Error('Публичные ссылки недоступны в демо-версии');
	}

	async unshare(): Promise<void> {
		throw new Error('Публичные ссылки недоступны в демо-версии');
	}

	async loadText(): Promise<CloudTextData> {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Нет активного пользователя');

		return {
			text: storage.get(key(user.id, 'cloud-text')) ?? '',
			revision: Number(storage.get(key(user.id, 'cloud-text-revision')) ?? 0),
		};
	}

	async saveText(text: string, revision: number): Promise<CloudTextData> {
		const user = this.getCurrentUser();
		if (!user) throw new Error('Нет активного пользователя');

		const current = await this.loadText();

		if (current.revision !== revision) throw new Error('Текст изменён в другой вкладке');

		const nextRevision = current.text === text ? revision : revision + 1;

		storage.set(key(user.id, 'cloud-text'), text);
		storage.set(key(user.id, 'cloud-text-revision'), String(nextRevision));

		return { text, revision: nextRevision };
	}
}

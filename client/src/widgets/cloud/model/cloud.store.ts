import axios from 'axios';
import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import type { IBaseUserPort } from '@/entities/user';
import { AsyncStore, Debouncer } from '@/shared/lib/store';

import type { CloudData, CloudFile, CloudSort, ICloudRepo } from '.';
import { CLOUD_STORAGE_BYTES } from '.';

const TEXT_SAVE_DELAY = 3000;

export class CloudStore extends AsyncStore {
	private readonly textDebouncer = new Debouncer();

	private savedText = '';
	private textRevision = 0;

	private savingPromise: Promise<void> | null = null;

	private session = 0;
	private refreshRequestId = 0;
	private isRefreshingText = false;

	files: CloudFile[] = [];
	isUpdatingFiles = false;

	usedBytes = 0;
	quotaBytes = CLOUD_STORAGE_BYTES;

	searchQuery = '';
	sortBy: CloudSort = 'newest';
	favoritesOnly = false;

	text = '';
	textConflict = false;
	textSaveError: string | null = null;
	isResolvingTextConflict = false;

	isReady = false;
	isUploading = false;
	isSavingText = false;

	uploadProgress = 0;
	uploadFileIndex = 0;
	uploadFilesCount = 0;
	uploadFileName = '';
	uploadFileSize = 0;
	uploadLoadedBytes = 0;
	uploadSpeed = 0;
	uploadRemaining: number | null = null;

	get usagePercent(): number {
		if (!this.quotaBytes) return 0;
		return Math.min(100, (this.usedBytes / this.quotaBytes) * 100);
	}

	get availableBytes(): number {
		return Math.max(0, this.quotaBytes - this.usedBytes);
	}

	get isTextDirty(): boolean {
		return this.text !== this.savedText;
	}

	get visibleFiles(): CloudFile[] {
		const query = this.searchQuery.trim().toLocaleLowerCase();

		const files = this.files.filter((file) => {
			const matchesSearch = file.name.toLocaleLowerCase().includes(query);
			const matchesFavorite = !this.favoritesOnly || file.isFavorite;
			return matchesSearch && matchesFavorite;
		});

		return files.sort((a, b) => {
			switch (this.sortBy) {
				case 'oldest':
					return Date.parse(a.createdAt) - Date.parse(b.createdAt);
				case 'name':
					return a.name.localeCompare(b.name, 'ru', { numeric: true, sensitivity: 'base' });
				case 'size':
					return b.size - a.size;
				default:
					return Date.parse(b.createdAt) - Date.parse(a.createdAt);
			}
		});
	}

	get isSyncing(): boolean {
		return (
			this.isUpdatingFiles ||
			this.isSavingText ||
			this.isResolvingTextConflict ||
			(this.isTextDirty && !this.textSaveError && !this.textConflict)
		);
	}

	setSearchQuery(value: string): void {
		this.searchQuery = value;
	}

	setSortBy(value: CloudSort): void {
		this.sortBy = value;
	}

	setFavoritesOnly(value: boolean): void {
		this.favoritesOnly = value;
	}

	async load(userId: string): Promise<void> {
		if (this.isLoading) return;

		const session = this.session;
		const revision = this.textRevision;
		const savedText = this.savedText;

		await this.withLoading(async () => {
			const data = await this.repo.load();

			if (!this.isCurrentSession(userId, session)) return;

			runInAction(() => this.applyData(data, revision, savedText));
		});
	}

	async refresh(): Promise<void> {
		const userId = this.userStore.id;
		if (!userId) return;

		await this.load(userId);
	}

	async refreshText(): Promise<void> {
		const userId = this.userStore.id;

		if (!userId || !this.isReady || this.isRefreshingText) return;
		if (this.isTextDirty || this.isSavingText || this.textConflict) return;

		const session = this.session;
		const revision = this.textRevision;
		const savedText = this.savedText;
		const requestId = ++this.refreshRequestId;

		this.isRefreshingText = true;

		try {
			const data = await this.repo.loadText();

			if (
				requestId !== this.refreshRequestId ||
				!this.isCurrentSession(userId, session) ||
				this.isTextDirty ||
				this.isSavingText ||
				this.textConflict ||
				this.textRevision !== revision ||
				this.savedText !== savedText
			) {
				return;
			}

			runInAction(() => this.applyText(data.text, data.revision));
		} finally {
			if (requestId === this.refreshRequestId) this.isRefreshingText = false;
		}
	}

	async upload(files: File[]): Promise<void> {
		if (this.isUploading || !files.length) return;

		const total = files.reduce((sum, file) => sum + file.size, 0);
		if (total > this.availableBytes) throw new Error('Недостаточно свободного места');

		const userId = this.userStore.id;
		const session = this.session;

		this.setUploading(true);
		this.setUploadProgress(0);

		runInAction(() => {
			this.uploadFilesCount = files.length;
			this.uploadFileIndex = 0;
		});

		let uploadedBytes = 0;

		try {
			for (const [index, file] of files.entries()) {
				if (!userId || !this.isCurrentSession(userId, session)) return;

				runInAction(() => {
					this.uploadFileIndex = index + 1;
					this.uploadFileName = file.name;
					this.uploadFileSize = file.size;
					this.uploadLoadedBytes = 0;
					this.uploadSpeed = 0;
					this.uploadRemaining = null;
				});

				await this.repo.upload(file, ({ loaded, speed, remaining }) => {
					if (!this.isCurrentSession(userId, session)) return;

					runInAction(() => {
						this.uploadLoadedBytes = loaded;
						this.uploadSpeed = speed;
						this.uploadRemaining = remaining;
						this.uploadProgress = Math.round(((uploadedBytes + loaded) / total) * 100);
					});
				});

				uploadedBytes += file.size;

				runInAction(() => {
					this.uploadLoadedBytes = file.size;
					this.uploadProgress = Math.round((uploadedBytes / total) * 100);
				});
			}
		} finally {
			if (this.session === session) {
				runInAction(() => {
					this.isUploading = false;
					this.uploadProgress = 0;
					this.uploadFileIndex = 0;
					this.uploadFilesCount = 0;
					this.uploadFileName = '';
					this.uploadFileSize = 0;
					this.uploadLoadedBytes = 0;
					this.uploadSpeed = 0;
					this.uploadRemaining = null;
				});

				if (userId && this.userStore.id === userId) await this.load(userId);
			}
		}
	}

	async download(file: CloudFile): Promise<void> {
		await this.repo.download(file.id, file.name);
	}

	async downloadMany(ids: string[]): Promise<void> {
		await this.withFileSync(async () => {
			for (const id of ids) {
				const file = this.files.find((item) => item.id === id);
				if (!file) continue;

				await this.download(file);
			}
		});
	}

	async getPreview(id: string): Promise<Blob> {
		return this.repo.getPreview(id);
	}

	async renameFile(id: string, name: string): Promise<void> {
		const trimmed = name.trim();
		if (!trimmed) throw new Error('Имя файла не может быть пустым');

		const file = this.files.find((item) => item.id === id);
		if (!file || file.name === trimmed) return;

		await this.withFileSync(async () => {
			await this.repo.update(id, { name: trimmed });
			await this.refresh();
		});
	}

	async toggleFavorite(id: string): Promise<void> {
		const file = this.files.find((item) => item.id === id);
		if (!file) return;

		await this.withFileSync(async () => {
			await this.repo.update(id, { isFavorite: !file.isFavorite });
			await this.refresh();
		});
	}

	async delete(id: string): Promise<void> {
		await this.withFileSync(async () => {
			await this.repo.delete(id);
			await this.refresh();
		});
	}

	async deleteMany(ids: string[]): Promise<void> {
		if (!ids.length) return;

		await this.withFileSync(async () => {
			await this.repo.deleteMany(ids);
			await this.refresh();
		});
	}

	async share(id: string): Promise<string> {
		return this.withFileSync(async () => {
			const url = await this.repo.share(id);
			await this.refresh();

			return url;
		});
	}

	async unshare(id: string): Promise<void> {
		await this.withFileSync(async () => {
			await this.repo.unshare(id);
			await this.refresh();
		});
	}

	setText(value: string): void {
		if (this.text === value) return;

		this.text = value;
		this.textDebouncer.cancel();

		if (!this.textConflict) this.textSaveError = null;

		if (!this.isTextDirty || !this.userStore.id || this.textConflict) return;

		this.scheduleTextSave();
	}

	async saveText(): Promise<void> {
		this.textDebouncer.cancel();

		const userId = this.userStore.id;
		const session = this.session;

		if (!userId || !this.isReady || this.textConflict || this.isResolvingTextConflict) return;

		if (this.savingPromise) return this.savingPromise;

		if (!this.isTextDirty) return;

		const promise = this.persistText(userId, session);

		this.savingPromise = promise;

		try {
			await promise;
		} finally {
			if (this.savingPromise === promise) this.savingPromise = null;

			if (this.isCurrentSession(userId, session) && this.isTextDirty && !this.textSaveError && !this.textConflict)
				this.scheduleTextSave();
		}
	}

	async saveTextAsFile(): Promise<void> {
		const text = this.text;
		if (!text.trim()) throw new Error('Текстовый буфер пуст');

		const now = new Date();

		const date = [
			now.getFullYear(),
			String(now.getMonth() + 1).padStart(2, '0'),
			String(now.getDate()).padStart(2, '0'),
		].join('-');

		const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
			.map((value) => String(value).padStart(2, '0'))
			.join('-');

		const name = `Text_${date} ${time}.txt`;
		const file = new File([text], name, { type: 'text/plain;charset=utf-8' });

		await this.withFileSync(async () => {
			await this.upload([file]);
		});
	}

	async acceptServerText(): Promise<void> {
		const userId = this.userStore.id;
		const session = this.session;

		if (!userId || !this.isReady || !this.textConflict || this.isResolvingTextConflict) return;

		this.isResolvingTextConflict = true;

		try {
			const data = await this.repo.loadText();

			if (!this.isCurrentSession(userId, session)) return;

			runInAction(() => {
				this.textDebouncer.cancel();
				this.applyText(data.text, data.revision);
				this.textConflict = false;
			});
		} finally {
			if (this.isCurrentSession(userId, session)) runInAction(() => (this.isResolvingTextConflict = false));
		}
	}

	async overwriteServerText(): Promise<void> {
		const userId = this.userStore.id;
		const session = this.session;

		if (!userId || !this.isReady || !this.textConflict || this.isResolvingTextConflict) return;

		this.isResolvingTextConflict = true;

		try {
			const server = await this.repo.loadText();

			if (!this.isCurrentSession(userId, session)) return;

			const snapshot = this.text;

			const result = await this.repo.saveText(snapshot, server.revision);

			if (!this.isCurrentSession(userId, session)) return;

			runInAction(() => {
				this.savedText = snapshot;
				this.textRevision = result.revision;
				this.textConflict = false;
				this.textSaveError = null;
			});

			if (this.isTextDirty) this.scheduleTextSave();
		} catch (error) {
			if (this.isCurrentSession(userId, session)) {
				const conflict = axios.isAxiosError(error) && error.response?.status === 409;

				runInAction(() => {
					this.textConflict = true;
					this.textSaveError = conflict
						? 'Текст снова изменён на другом устройстве'
						: 'Не удалось разрешить конфликт';
				});
			}

			throw error;
		} finally {
			if (this.isCurrentSession(userId, session)) runInAction(() => (this.isResolvingTextConflict = false));
		}
	}

	private async persistText(userId: string, session: number): Promise<void> {
		const snapshot = this.text;
		const revision = this.textRevision;

		this.setSavingText(true);

		try {
			const result = await this.repo.saveText(snapshot, revision);

			if (!this.isCurrentSession(userId, session)) return;

			runInAction(() => {
				this.savedText = snapshot;
				this.textRevision = result.revision;
				this.textSaveError = null;
				this.textConflict = false;
			});
		} catch (error) {
			if (this.isCurrentSession(userId, session)) {
				const conflict = axios.isAxiosError(error) && error.response?.status === 409;

				runInAction(() => {
					this.textConflict = conflict;
					this.textSaveError = conflict ? 'Текст изменён на другом устройстве' : 'Не удалось сохранить текст';
				});
			}

			throw error;
		} finally {
			if (this.isCurrentSession(userId, session)) this.setSavingText(false);
		}
	}

	private scheduleTextSave(): void {
		this.textDebouncer.cancel();

		this.textDebouncer.schedule(() => {
			void this.saveText().catch(() => {});
		}, TEXT_SAVE_DELAY);
	}

	private applyData(data: CloudData, revision: number, savedText: string): void {
		this.files = data.files;
		this.usedBytes = data.usedBytes;
		this.quotaBytes = data.quotaBytes;

		if (
			!this.isTextDirty &&
			!this.isSavingText &&
			!this.textConflict &&
			this.textRevision === revision &&
			this.savedText === savedText &&
			data.textRevision >= this.textRevision
		) {
			this.applyText(data.text, data.textRevision);
		}

		this.isReady = true;
	}

	private applyText(text: string, revision: number): void {
		this.text = text;
		this.savedText = text;
		this.textRevision = revision;
		this.textSaveError = null;
	}

	private isCurrentSession(userId: string, session: number): boolean {
		return this.session === session && this.userStore.id === userId;
	}

	private setUploading(value: boolean): void {
		this.isUploading = value;
	}

	private setUploadProgress(value: number): void {
		this.uploadProgress = value;
	}

	private setSavingText(value: boolean): void {
		this.isSavingText = value;
	}

	private async withFileSync<T>(operation: () => Promise<T>): Promise<T> {
		this.isUpdatingFiles = true;

		try {
			return await operation();
		} finally {
			runInAction(() => (this.isUpdatingFiles = false));
		}
	}

	constructor(
		private readonly userStore: IBaseUserPort,
		private readonly repo: ICloudRepo
	) {
		super();

		makeObservable<
			this,
			'savedText' | 'applyData' | 'applyText' | 'setUploading' | 'setUploadProgress' | 'setSavingText' | 'reset'
		>(this, {
			files: observable,
			isUpdatingFiles: observable,
			usedBytes: observable,
			quotaBytes: observable,
			searchQuery: observable,
			sortBy: observable,
			favoritesOnly: observable,

			text: observable,
			savedText: observable,
			textConflict: observable,
			textSaveError: observable,
			isResolvingTextConflict: observable,

			isReady: observable,
			isUploading: observable,
			isSavingText: observable,
			uploadProgress: observable,
			uploadFileIndex: observable,
			uploadFilesCount: observable,
			uploadFileName: observable,
			uploadFileSize: observable,
			uploadLoadedBytes: observable,
			uploadSpeed: observable,
			uploadRemaining: observable,

			usagePercent: computed,
			availableBytes: computed,
			isTextDirty: computed,
			visibleFiles: computed,
			isSyncing: computed,

			setSearchQuery: action,
			setSortBy: action,
			setFavoritesOnly: action,

			setText: action,
			applyText: action,
			refreshText: action,

			applyData: action,
			setUploading: action,
			setUploadProgress: action,
			setSavingText: action,
			reset: action,
		});
	}

	init(): void {
		if (this.inited) return;

		this.inited = true;

		this.track(
			reaction(
				() => this.userStore.id,
				(userId) => {
					this.session++;
					this.reset();

					if (!userId) return;

					void this.load(userId);
				},
				{ fireImmediately: true }
			)
		);
	}

	destroy(): void {
		this.session++;
		this.reset();

		super.destroy();
	}

	protected reset(): void {
		this.textDebouncer.cancel();

		this.refreshRequestId++;
		this.isRefreshingText = false;

		this.files = [];
		this.isUpdatingFiles = false;
		this.usedBytes = 0;
		this.quotaBytes = CLOUD_STORAGE_BYTES;

		this.searchQuery = '';
		this.sortBy = 'newest';
		this.favoritesOnly = false;

		this.text = '';
		this.savedText = '';
		this.textRevision = 0;

		this.textConflict = false;
		this.textSaveError = null;
		this.isResolvingTextConflict = false;

		this.isReady = false;
		this.isUploading = false;
		this.isSavingText = false;
		this.savingPromise = null;
		this.uploadProgress = 0;
	}
}

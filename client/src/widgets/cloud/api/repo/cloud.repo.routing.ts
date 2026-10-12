import { type Feature, type IUserRoutingPort, type Operation, PermissionService } from '@/entities/user';
import { PermissionError } from '@/shared/lib/errors';

import type { CloudData, CloudFilePatch, CloudTextData, ICloudRepo } from '../../model';
import { CloudRepoDemo, CloudRepoLaravel } from '.';

export class CloudRepoRouting implements ICloudRepo {
	private readonly realRepo: ICloudRepo;
	private readonly demoRepo: ICloudRepo;

	constructor(private readonly userStore: IUserRoutingPort) {
		this.realRepo = new CloudRepoLaravel();
		this.demoRepo = new CloudRepoDemo(() => this.userStore.user);
	}

	private getTargetRepo(): ICloudRepo {
		return this.userStore.userRole === 'demo' ? this.demoRepo : this.realRepo;
	}

	private checkPermission<F extends Feature>(feature: F, operation: Operation<F>, message?: string): void {
		if (!PermissionService.canPerform(this.userStore.userRole, feature, operation)) {
			const defaultMsg = this.userStore.userRole === 'demo' ? 'Недоступно в демо-версии' : 'Недостаточно прав';
			throw new PermissionError(message ?? defaultMsg);
		}
	}

	async load(): Promise<CloudData> {
		this.checkPermission('cloud', 'read');
		return this.getTargetRepo().load();
	}

	async getPreview(id: string): Promise<Blob> {
		this.checkPermission('cloud', 'read');
		return this.getTargetRepo().getPreview(id);
	}

	async upload(file: File, onProgress: (percent: number) => void): Promise<void> {
		this.checkPermission('cloud', 'upload');
		return this.getTargetRepo().upload(file, onProgress);
	}

	async download(id: string, filename: string): Promise<void> {
		this.checkPermission('cloud', 'read');
		return this.getTargetRepo().download(id, filename);
	}

	async update(id: string, patch: CloudFilePatch): Promise<void> {
		this.checkPermission('cloud', 'save');
		return this.getTargetRepo().update(id, patch);
	}

	async delete(id: string): Promise<void> {
		this.checkPermission('cloud', 'delete');
		return this.getTargetRepo().delete(id);
	}

	async share(id: string): Promise<string> {
		this.checkPermission('cloud', 'use');
		return this.getTargetRepo().share(id);
	}

	async unshare(id: string): Promise<void> {
		this.checkPermission('cloud', 'use');
		return this.getTargetRepo().unshare(id);
	}

	async loadText(): Promise<CloudTextData> {
		this.checkPermission('cloud', 'read');
		return this.getTargetRepo().loadText();
	}

	async saveText(text: string, revision: number): Promise<CloudTextData> {
		this.checkPermission('cloud', 'save');
		return this.getTargetRepo().saveText(text, revision);
	}
}

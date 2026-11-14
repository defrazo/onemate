import { type Feature, type IUserRoutingPort, type Operation, PermissionService } from '@/entities/user';
import { PermissionError } from '@/shared/lib/errors';

import type { IAssistantRepo } from '../../model/ports';
import type {
	ArchivedConversation,
	ArchivePage,
	AssistantGeneration,
	AssistantLimits,
	AssistantMessage,
	AssistantSnapshot,
	SendMessage,
} from '../../model/types';
import { AssistantRepoDemo } from './assistant.repo.demo';
import { AssistantRepoLaravel } from './assistant.repo.laravel';

export class AssistantRepoRouting implements IAssistantRepo {
	private readonly realRepo: IAssistantRepo;
	private readonly demoRepo: IAssistantRepo;

	constructor(private readonly userStore: IUserRoutingPort) {
		this.realRepo = new AssistantRepoLaravel();
		this.demoRepo = new AssistantRepoDemo();
	}

	private getTargetRepo(): IAssistantRepo {
		return this.userStore.userRole === 'demo' ? this.demoRepo : this.realRepo;
	}

	private checkPermission<F extends Feature>(feature: F, operation: Operation<F>, message?: string): void {
		if (!PermissionService.canPerform(this.userStore.userRole, feature, operation)) {
			const defaultMsg = this.userStore.userRole === 'demo' ? 'Недоступно в демо-режиме' : 'Недостаточно прав';
			throw new PermissionError(message ?? defaultMsg);
		}
	}

	async limits(signal: AbortSignal): Promise<AssistantLimits> {
		this.checkPermission('assistant', 'read');
		return this.getTargetRepo().limits(signal);
	}

	async active(signal: AbortSignal): Promise<AssistantSnapshot> {
		this.checkPermission('assistant', 'read');
		return this.getTargetRepo().active(signal);
	}

	async history(id: string, before: number, signal: AbortSignal): Promise<AssistantSnapshot> {
		this.checkPermission('assistant', 'read');
		return this.getTargetRepo().history(id, before, signal);
	}

	async send(
		data: SendMessage,
		signal: AbortSignal
	): Promise<{ message: AssistantMessage; generation: AssistantGeneration }> {
		this.checkPermission('assistant', 'use');
		return this.getTargetRepo().send(data, signal);
	}

	async generation(id: string, signal: AbortSignal): Promise<AssistantGeneration> {
		this.checkPermission('assistant', 'read');
		return this.getTargetRepo().generation(id, signal);
	}

	async cancel(id: string, signal: AbortSignal): Promise<AssistantGeneration> {
		this.checkPermission('assistant', 'use');
		return this.getTargetRepo().cancel(id, signal);
	}

	async retry(id: string, requestId: string, signal: AbortSignal): Promise<AssistantGeneration> {
		this.checkPermission('assistant', 'use');
		return this.getTargetRepo().retry(id, requestId, signal);
	}

	async regenerate(
		id: string,
		requestId: string,
		signal: AbortSignal,
		searchEnabled = false
	): Promise<AssistantGeneration> {
		this.checkPermission('assistant', 'use');
		return this.getTargetRepo().regenerate(id, requestId, signal, searchEnabled);
	}

	async newConversation(signal: AbortSignal): Promise<{ archived_conversation_id: string | null }> {
		this.checkPermission('assistant', 'save');
		return this.getTargetRepo().newConversation(signal);
	}

	async resumeConversation(
		id: string,
		expectedActiveId: string | null,
		signal: AbortSignal
	): Promise<AssistantSnapshot> {
		this.checkPermission('assistant', 'save');
		return this.getTargetRepo().resumeConversation(id, expectedActiveId, signal);
	}

	async archive(search: string, page: number, signal: AbortSignal): Promise<ArchivePage> {
		this.checkPermission('assistant', 'read');
		return this.getTargetRepo().archive(search, page, signal);
	}

	async archivedMessages(id: string, before: number | null, signal: AbortSignal): Promise<AssistantSnapshot> {
		this.checkPermission('assistant', 'read');
		return this.getTargetRepo().archivedMessages(id, before, signal);
	}

	async pin(id: string, pinned: boolean, signal: AbortSignal): Promise<ArchivedConversation> {
		this.checkPermission('assistant', 'save');
		return this.getTargetRepo().pin(id, pinned, signal);
	}

	async deleteConversation(id: string, signal: AbortSignal): Promise<{ deleted_conversation_id: string }> {
		this.checkPermission('assistant', 'delete');
		return this.getTargetRepo().deleteConversation(id, signal);
	}
}

import { api } from '@/shared/api';

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

export class AssistantRepoLaravel implements IAssistantRepo {
	async limits(signal: AbortSignal): Promise<AssistantLimits> {
		const { data } = await api.get<AssistantLimits>('/assistant/limits', { signal });
		return data;
	}

	async active(signal: AbortSignal): Promise<AssistantSnapshot> {
		const { data } = await api.get<AssistantSnapshot>('/assistant/active', { signal });
		return data;
	}

	async history(id: string, before: number, signal: AbortSignal): Promise<AssistantSnapshot> {
		const { data } = await api.get<AssistantSnapshot>(`/assistant/conversations/${id}/messages`, {
			params: { before_sequence: before },
			signal,
		});
		return data;
	}

	async send(
		message: SendMessage,
		signal: AbortSignal
	): Promise<{ message: AssistantMessage; generation: AssistantGeneration }> {
		const { data } = await api.post<{ message: AssistantMessage; generation: AssistantGeneration }>(
			'/assistant/messages',
			message,
			{ signal }
		);

		return data;
	}

	async generation(id: string, signal: AbortSignal): Promise<AssistantGeneration> {
		const { data } = await api.get<AssistantGeneration>(`/assistant/generations/${id}`, { signal });
		return data;
	}

	async cancel(id: string, signal: AbortSignal): Promise<AssistantGeneration> {
		const { data } = await api.post<AssistantGeneration>(`/assistant/generations/${id}/cancel`, {}, { signal });
		return data;
	}

	async retry(id: string, requestId: string, signal: AbortSignal): Promise<AssistantGeneration> {
		const { data } = await api.post<AssistantGeneration>(
			`/assistant/generations/${id}/retry`,
			{ request_id: requestId },
			{ signal }
		);
		return data;
	}

	async regenerate(
		id: string,
		requestId: string,
		signal: AbortSignal,
		searchEnabled = false
	): Promise<AssistantGeneration> {
		const { data } = await api.post<AssistantGeneration>(
			`/assistant/generations/${id}/regenerate`,
			{ request_id: requestId, search_enabled: searchEnabled },
			{ signal }
		);
		return data;
	}

	async newConversation(signal: AbortSignal): Promise<{ archived_conversation_id: string | null }> {
		const { data } = await api.post<{ archived_conversation_id: string | null }>(
			'/assistant/conversations/new',
			{},
			{ signal }
		);
		return data;
	}

	async resumeConversation(
		id: string,
		expectedActiveId: string | null,
		signal: AbortSignal
	): Promise<AssistantSnapshot> {
		const { data } = await api.post<AssistantSnapshot>(
			`/assistant/conversations/${id}/resume`,
			{ expected_active_conversation_id: expectedActiveId },
			{ signal }
		);
		return data;
	}

	async archive(search: string, page: number, signal: AbortSignal): Promise<ArchivePage> {
		const { data } = await api.get<ArchivePage>('/assistant/conversations', { params: { search, page }, signal });
		return data;
	}

	async archivedMessages(id: string, before: number | null, signal: AbortSignal): Promise<AssistantSnapshot> {
		const { data } = await api.get<AssistantSnapshot>(`/assistant/conversations/${id}/messages`, {
			params: before === null ? {} : { before_sequence: before },
			signal,
		});
		return data;
	}

	async pin(id: string, pinned: boolean, signal: AbortSignal): Promise<ArchivedConversation> {
		const { data } = await api.patch<ArchivedConversation>(
			`/assistant/conversations/${id}/pin`,
			{ pinned },
			{ signal }
		);
		return data;
	}

	async deleteConversation(id: string, signal: AbortSignal): Promise<{ deleted_conversation_id: string }> {
		const { data } = await api.delete<{ deleted_conversation_id: string }>(`/assistant/conversations/${id}`, {
			signal,
		});
		return data;
	}
}

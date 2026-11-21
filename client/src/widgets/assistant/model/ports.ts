import type {
	ArchivedConversation,
	ArchivePage,
	AssistantGeneration,
	AssistantLimits,
	AssistantMessage,
	AssistantSnapshot,
	SendMessage,
} from './types';

export interface IAssistantRepo {
	limits(signal: AbortSignal): Promise<AssistantLimits>;
	active(signal: AbortSignal): Promise<AssistantSnapshot>;
	history(id: string, before: number, signal: AbortSignal): Promise<AssistantSnapshot>;
	send(
		data: SendMessage,
		signal: AbortSignal
	): Promise<{ message: AssistantMessage; generation: AssistantGeneration }>;
	generation(id: string, signal: AbortSignal): Promise<AssistantGeneration>;
	cancel(id: string, signal: AbortSignal): Promise<AssistantGeneration>;
	retry(id: string, requestId: string, signal: AbortSignal): Promise<AssistantGeneration>;
	regenerate(
		id: string,
		requestId: string,
		signal: AbortSignal,
		searchEnabled?: boolean
	): Promise<AssistantGeneration>;
	newConversation(signal: AbortSignal): Promise<{ archived_conversation_id: string | null }>;
	resumeConversation(id: string, expectedActiveId: string | null, signal: AbortSignal): Promise<AssistantSnapshot>;
	archive(search: string, page: number, signal: AbortSignal): Promise<ArchivePage>;
	archivedMessages(id: string, before: number | null, signal: AbortSignal): Promise<AssistantSnapshot>;
	pin(id: string, pinned: boolean, signal: AbortSignal): Promise<ArchivedConversation>;
	deleteConversation(id: string, signal: AbortSignal): Promise<{ deleted_conversation_id: string }>;
}

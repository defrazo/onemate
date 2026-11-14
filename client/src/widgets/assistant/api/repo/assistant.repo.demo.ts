import { RestrictedAccess } from '@/shared/lib/errors';

import type { IAssistantRepo } from '../../model/ports';
import type {
	ArchivedConversation,
	ArchivePage,
	AssistantGeneration,
	AssistantLimits,
	AssistantMessage,
	AssistantSnapshot,
} from '../../model/types';

export class AssistantRepoDemo implements IAssistantRepo {
	async limits(): Promise<AssistantLimits> {
		throw new RestrictedAccess();
	}

	async active(): Promise<AssistantSnapshot> {
		throw new RestrictedAccess();
	}

	async history(): Promise<AssistantSnapshot> {
		throw new RestrictedAccess();
	}

	async send(): Promise<{ message: AssistantMessage; generation: AssistantGeneration }> {
		throw new RestrictedAccess();
	}

	async generation(): Promise<AssistantGeneration> {
		throw new RestrictedAccess();
	}

	async cancel(): Promise<AssistantGeneration> {
		throw new RestrictedAccess();
	}

	async retry(): Promise<AssistantGeneration> {
		throw new RestrictedAccess();
	}

	async regenerate(): Promise<AssistantGeneration> {
		throw new RestrictedAccess();
	}

	async newConversation(): Promise<{ archived_conversation_id: string | null }> {
		throw new RestrictedAccess();
	}

	async resumeConversation(): Promise<AssistantSnapshot> {
		throw new RestrictedAccess();
	}

	async archive(): Promise<ArchivePage> {
		throw new RestrictedAccess();
	}

	async archivedMessages(): Promise<AssistantSnapshot> {
		throw new RestrictedAccess();
	}

	async pin(): Promise<ArchivedConversation> {
		throw new RestrictedAccess();
	}

	async deleteConversation(): Promise<{ deleted_conversation_id: string }> {
		throw new RestrictedAccess();
	}
}

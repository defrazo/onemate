export type AssistantMode = 'ask' | 'explain' | 'improve' | 'translate' | 'ideas';

export interface AssistantLimits {
	model: string;
	observed_at: string | null;
	daily_requests_local: { source: 'onemate'; limit: number; used: number; period_start: string };
	daily_requests: {
		source: 'groq';
		limit: number;
		remaining: number | null;
		stale: boolean;
		reset_at: string | null;
	};
	minute_tokens: AssistantLimits['daily_requests'];
	daily_tokens: {
		source: 'onemate';
		limit: number;
		used: number | null;
		remaining: null;
		unmeasured_attempts: number;
		period_start: string;
	};
	minute_requests: { source: 'onemate'; limit: number; used: number; remaining: null };
}

export type AssistantPhase = 'idle' | 'loading' | 'generating' | 'stopping' | 'error';

export interface AssistantMessage {
	answer_generation?: AssistantGeneration | null;
	id: string;
	sequence: number;
	reply_to_message_id: string | null;
	role: 'user' | 'assistant';
	content: string;
	generation?: AssistantGeneration;
}

export interface AssistantGeneration {
	search_enabled: boolean;
	search_executed: boolean | null;
	sources: SearchSource[];
	provider: string;
	model: string;
	actual_model: string | null;
	id: string;
	conversation_id: string;
	user_message_id: string;
	mode: AssistantMode;
	status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
	execution_pending: boolean;
	error_code: string | null;
	input_tokens: number | null;
	output_tokens: number | null;
	total_tokens: number | null;
	duration_ms: number | null;
	created_at: string;
	response: AssistantMessage | null;
}

export interface SearchSource {
	url: string;
	title: string;
	domain: string;
}

export interface AssistantSnapshot {
	conversation: { id: string; title: string } | null;
	messages: AssistantMessage[];
	generations: AssistantGeneration[];
	pending_generation: AssistantGeneration | null;
	execution_pending: boolean;
	pagination: { has_more: boolean; before_sequence: number | null };
}

export type SendMessage = {
	request_id: string;
	conversation_id: string | null;
	mode: AssistantMode;
	content: string;
	search_enabled?: boolean;
};

export interface ArchivedConversation {
	id: string;
	title: string;
	archived_at: string;
	pinned_at: string | null;
	last_activity_at: string;
}

export interface ArchivePage {
	data: ArchivedConversation[];
	meta: { current_page: number; last_page: number };
}

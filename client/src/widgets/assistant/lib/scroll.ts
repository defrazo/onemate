import type { AssistantMessage } from '../model/types';

export const messageScrollTarget = (
	previousLastId: string | null,
	messages: AssistantMessage[],
	manual: boolean
): 'end' | AssistantMessage | null => {
	const last = messages.at(-1);
	if (!last) return null;
	if (previousLastId === null) return 'end';
	if (manual || last.id === previousLastId) return null;
	return last;
};

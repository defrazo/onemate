import { isAxiosError } from 'axios';

export class BoardRevisionConflictError extends Error {
	readonly code = 'BOARD_REVISION_CONFLICT';

	constructor(readonly currentRevision: number) {
		super('Доска была изменена в другом сеансе');
		this.name = 'BoardRevisionConflictError';
	}
}

export const rethrowKanbanError = (error: unknown): never => {
	if (isAxiosError(error) && error.response?.status === 409) {
		const data: unknown = error.response.data;

		if (
			typeof data === 'object' &&
			data !== null &&
			'code' in data &&
			data.code === 'BOARD_REVISION_CONFLICT' &&
			'current_revision' in data &&
			typeof data.current_revision === 'number'
		) {
			throw new BoardRevisionConflictError(data.current_revision);
		}
	}

	throw error;
};

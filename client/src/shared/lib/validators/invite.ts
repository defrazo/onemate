import type { ValidationResult } from '.';

export const validateInvite = (invite: string): ValidationResult => {
	const normalized = invite.trim();
	if (!normalized) return 'empty';

	const inviteRegex = /^[a-zA-Z0-9_-]{2,32}$/;
	return inviteRegex.test(normalized) ? 'valid' : 'invalid';
};

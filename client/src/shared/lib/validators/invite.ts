export const validateInvite = (invite: string): 'empty' | 'invalid' | 'valid' => {
	const normalized = invite.trim();
	if (!normalized) return 'empty';

	const inviteRegex = /^[a-zA-Z0-9_-]{2,32}$/;
	return inviteRegex.test(normalized) ? 'valid' : 'invalid';
};

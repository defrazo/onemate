const RESEND_EMAIL_COOLDOWN_KEY = 'resendEmailCooldownUntil';
const RESEND_COOLDOWN_SEC = 60;

export const emailCooldown = {
	start() {
		const until = Date.now() + RESEND_COOLDOWN_SEC * 1000;
		sessionStorage.setItem(RESEND_EMAIL_COOLDOWN_KEY, String(until));
	},

	getRemaining(): number {
		const until = Number(sessionStorage.getItem(RESEND_EMAIL_COOLDOWN_KEY));
		if (!until) return 0;

		return Math.max(Math.ceil((until - Date.now()) / 1000), 0);
	},
};

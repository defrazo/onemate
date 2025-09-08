export type User = {
	id: string;
	email: string | null;
	user_metadata: Record<string, any>;
	app_metadata: Record<string, any>;
	email_confirmed_at: string | null;
};

export type UserByEmail = {
	id: string;
	email: string;
	email_confirmed_at: string;
};

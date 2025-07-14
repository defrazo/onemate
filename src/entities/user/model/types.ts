export type User = {
	id?: string;
	email?: string;
	user_metadata?: {
		username?: string;
		[key: string]: any;
	};
};

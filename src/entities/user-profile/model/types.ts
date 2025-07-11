export type UserProfile = {
	userId: string;
	avatarUrl?: string;
	firstName: string;
	lastName: string;
	birthDate: { year: string; month: string; day: string };
	gender: 'male' | 'female' | null;
	location: string;
	phone: string[];
	email: string[];
};

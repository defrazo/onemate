import { api } from '@/shared/api';

export interface OAuthAuthorization {
	client: { name: string };
	scopes: { id: string; description: string }[];
	authToken: string;
	csrfToken: string;
}

export const getOAuthAuthorization = async (): Promise<OAuthAuthorization> => {
	const { data } = await api.get<OAuthAuthorization>('/oauth/authorization');
	return data;
};

export const getOAuthReturnUrl = async (): Promise<string | null> => {
	const { data } = await api.get<{ url: string | null }>('/oauth/return-url');
	return data.url;
};

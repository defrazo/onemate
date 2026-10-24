import { api } from '@/shared/api';

import type { ConnectedApp, ConnectedAppsResponse } from '../model';

export const getApps = async (): Promise<ConnectedAppsResponse> => {
	const { data } = await api.get<ConnectedAppsResponse>('/user/connected-apps');
	return data;
};

export const disconnectApp = async (id: string, accountType: ConnectedApp['account_type']): Promise<void> => {
	await api.delete(`/user/connected-apps/${id}`, { data: { expected_account_type: accountType } });
};

import { api } from '@/shared/api';

import type { PortCheckResult } from '../model/types';

export const checkPort = async (host: string, port: number): Promise<PortCheckResult> => {
	const { data } = await api.post<PortCheckResult>('/network/port/check', {
		host,
		port,
	});

	return data;
};

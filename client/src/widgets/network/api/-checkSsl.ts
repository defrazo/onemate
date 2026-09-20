import { api } from '@/shared/api';

import type { SslCheckResult } from '../model/types';

export const checkSsl = async (host: string): Promise<SslCheckResult> => {
	const { data } = await api.post<SslCheckResult>('/network/ssl/check', {
		host,
	});

	return data;
};

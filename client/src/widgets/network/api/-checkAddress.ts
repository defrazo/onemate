import { api } from '@/shared/api';

import type { AddressCheckResult } from '../model/types';

export const checkAddress = async (url: string): Promise<AddressCheckResult> => {
	const { data } = await api.post<AddressCheckResult>('/network/address/check', { url });

	return data;
};

import { api } from '@/shared/api';

import type { AddressCheckResult } from '../model/types';

export const checkAddress = async (url: string): Promise<AddressCheckResult> => {
	const { data } = await api.post<AddressCheckResult>('/network/address/check', { url });

	return data;
};

import type { PortCheckResult } from '../model/types';

export const checkPort = async (host: string, port: number): Promise<PortCheckResult> => {
	const { data } = await api.post<PortCheckResult>('/network/port/check', {
		host,
		port,
	});

	return data;
};

import type { SslCheckResult } from '../model/types';

export const checkSsl = async (host: string): Promise<SslCheckResult> => {
	const { data } = await api.post<SslCheckResult>('/network/ssl/check', {
		host,
	});

	return data;
};

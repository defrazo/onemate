import { api } from '@/shared/api';

export const deleteMonitoredService = async (id: number): Promise<void> => {
	await api.delete(`/network/services/${id}`);
};

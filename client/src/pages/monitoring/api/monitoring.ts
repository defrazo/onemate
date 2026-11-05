import type { Role } from '@/entities/user';
import { api } from '@/shared/api';

export interface MonitoringCounts {
	cloudFiles: number;
	cloudBytes: number;
	notes: number;
	authLogs: number;
	locations: number;
	todoCanvases: number;
	todoLists: number;
	todoItems: number;
	todoCompleted: number;
	kanbanBoards: number;
	kanbanColumns: number;
	kanbanTasks: number;
	kanbanCompleted: number;
	networkServices: number;
	networkChecks: number;
	notifications: number;
}

export interface MonitoringData {
	stats: MonitoringCounts & {
		users: number;
		newUsers7: number;
		newUsers: number;
		cloudAverageBytes: number;
		cloudMaxBytes: number;
	};
	users: (MonitoringCounts & {
		id: string;
		username: string;
		email: string;
		role: Role;
		createdAt: string | null;
		lastLoginAt: string | null;
	})[];
}

export const getMonitoring = async (signal: AbortSignal): Promise<MonitoringData> => {
	const { data } = await api.get<MonitoringData>('/monitoring', { signal });
	return data;
};

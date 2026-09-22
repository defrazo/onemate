export type NetworkResourceStatus = 'up' | 'warning' | 'down';
export type NetworkResourceType = 'http' | 'tcp' | 'heartbeat';

export interface NetworkResource {
	id: string;
	name: string;
	target: string;
	type: NetworkResourceType;
	status: NetworkResourceStatus;
	responseTime?: number;
	statusCode?: number;
	uptime: number;
	lastChecked: string;
}

export type ServiceCheckResult = {
	url: string;
	status: 'up' | 'down';
	statusCode: number | null;
	responseTime: number | null;
	ip: string | null;
};

export type PortCheckResult = {
	host: string;
	port: number;
	status: 'open' | 'closed';
	responseTime: number | null;
	ip: string;
};

export type SslCheckResult = {
	host: string;
	status: 'valid' | 'invalid';
	issuer: string | null;
	validFrom: string | null;
	validTo: string | null;
	daysRemaining: number | null;
	ip: string;
};

export type MonitoredService = {
	id: number;
	userId: string;
	name: string;
	url: string;
	isActive: boolean;
	lastStatus: 'up' | 'down' | null;
	lastStatusCode: number | null;
	lastResponseTime: number | null;
	lastCheckedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type MonitoringCheck = {
	status: 'up' | 'down';
	statusCode: number | null;
	responseTime: number | null;
	checkedAt: string;
};

export type MonitoringHistory = {
	checks: MonitoringCheck[];
	uptime: number | null;
	incidents: number;
};

export type UpdateMonitoredService = {
	name?: string;
	url?: string;
	isActive?: boolean;
};

export type CreateMonitoredService = {
	name: string;
	url: string;
};

export type NetworkView = 'monitoring' | 'tools';

export type MonitoringType = 'http' | 'tcp';

export type ServiceStatus = 'up' | 'down';

export type ServiceCheckResult = {
	url: string;
	status: ServiceStatus;
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

type BaseMonitoredService = {
	id: number;
	userId: string;
	name: string;
	isActive: boolean;
	lastStatus: ServiceStatus | null;
	lastResponseTime: number | null;
	lastCheckedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type HttpMonitoredService = BaseMonitoredService & {
	type: 'http';
	url: string;
	lastStatusCode: number | null;
};

export type TcpMonitoredService = BaseMonitoredService & {
	type: 'tcp';
	host: string;
	port: number;
};

export type MonitoredService = HttpMonitoredService | TcpMonitoredService;

export type MonitoringCheck = {
	status: ServiceStatus;
	statusCode: number | null;
	responseTime: number | null;
	checkedAt: string;
};

export type MonitoringHistory = {
	checks: MonitoringCheck[];
	uptime: number | null;
	incidents: number;
};

export type CreateMonitoredService =
	| { type: 'http'; name: string; url: string }
	| { type: 'tcp'; name: string; host: string; port: number };

export type UpdateMonitoredService =
	| { type: 'http'; name?: string; url?: string; isActive?: boolean }
	| { type: 'tcp'; name?: string; host?: string; port?: number; isActive?: boolean };

export type NetworkView = 'monitoring' | 'tools';

import type {
	CreateMonitoredService,
	MonitoredService,
	MonitoringHistory,
	PortCheckResult,
	ServiceCheckResult,
	SslCheckResult,
	UpdateMonitoredService,
} from '.';

export interface INetworkRepo {
	loadServices(): Promise<MonitoredService[]>;
	loadHistory(serviceId: number): Promise<MonitoringHistory>;
	createService(data: CreateMonitoredService): Promise<MonitoredService>;
	checkMonitoredService(id: number): Promise<MonitoredService>;
	updateService(id: number, data: UpdateMonitoredService): Promise<MonitoredService>;
	deleteService(id: number): Promise<void>;
	checkService(url: string): Promise<ServiceCheckResult>;
	checkPort(host: string, port: number): Promise<PortCheckResult>;
	checkSsl(host: string): Promise<SslCheckResult>;
}

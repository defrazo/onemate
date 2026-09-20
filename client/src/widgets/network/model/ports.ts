import type {
	AddressCheckResult,
	CreateMonitoredService,
	MonitoredService,
	MonitoringHistory,
	PortCheckResult,
	SslCheckResult,
	UpdateMonitoredService,
} from '.';

export interface INetworkRepo {
	loadServices(): Promise<MonitoredService[]>;
	loadHistory(serviceId: number): Promise<MonitoringHistory>;
	createService(data: CreateMonitoredService): Promise<MonitoredService>;
	checkService(id: number): Promise<MonitoredService>;
	updateService(id: number, data: UpdateMonitoredService): Promise<MonitoredService>;
	deleteService(id: number): Promise<void>;
	checkAddress(url: string): Promise<AddressCheckResult>;
	checkPort(host: string, port: number): Promise<PortCheckResult>;
	checkSsl(host: string): Promise<SslCheckResult>;
}

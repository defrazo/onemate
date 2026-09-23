import { Feature, type IUserRoutingPort, Operation, PermissionService } from '@/entities/user';
import { PermissionError } from '@/shared/lib/errors';

import type {
	CreateMonitoredService,
	INetworkRepo,
	MonitoredService,
	MonitoringHistory,
	PortCheckResult,
	ServiceCheckResult,
	SslCheckResult,
	UpdateMonitoredService,
} from '../../model';
import { NetworkRepoDemo, NetworkRepoLaravel } from '.';

export class NetworkRepoRouting implements INetworkRepo {
	private readonly realRepo: INetworkRepo;
	private readonly demoRepo: INetworkRepo;

	constructor(private readonly userStore: IUserRoutingPort) {
		this.realRepo = new NetworkRepoLaravel();
		this.demoRepo = new NetworkRepoDemo(() => this.userStore.user);
	}

	private getTargetRepo(): INetworkRepo {
		return this.userStore.userRole === 'demo' ? this.demoRepo : this.realRepo;
	}

	private checkPermission<F extends Feature>(feature: F, operation: Operation<F>, message?: string): void {
		if (!PermissionService.canPerform(this.userStore.userRole, feature, operation)) {
			const defaultMsg = this.userStore.userRole === 'demo' ? 'Недоступно в демо-версии' : 'Недостаточно прав';
			throw new PermissionError(message ?? defaultMsg);
		}
	}

	async loadServices(): Promise<MonitoredService[]> {
		this.checkPermission('network', 'read');
		return this.getTargetRepo().loadServices();
	}

	async loadHistory(serviceId: number): Promise<MonitoringHistory> {
		this.checkPermission('network', 'read');
		return this.getTargetRepo().loadHistory(serviceId);
	}

	async createService(data: CreateMonitoredService): Promise<MonitoredService> {
		this.checkPermission('network', 'save');
		return this.getTargetRepo().createService(data);
	}

	async checkMonitoredService(id: number): Promise<MonitoredService> {
		this.checkPermission('network', 'save');
		return this.getTargetRepo().checkMonitoredService(id);
	}

	async updateService(id: number, data: UpdateMonitoredService): Promise<MonitoredService> {
		this.checkPermission('network', 'save');
		return this.getTargetRepo().updateService(id, data);
	}

	async deleteService(id: number): Promise<void> {
		this.checkPermission('network', 'delete');
		await this.getTargetRepo().deleteService(id);
	}

	async checkService(url: string): Promise<ServiceCheckResult> {
		this.checkPermission('network', 'use');
		return this.getTargetRepo().checkService(url);
	}

	async checkPort(host: string, port: number): Promise<PortCheckResult> {
		this.checkPermission('network', 'use');
		return this.getTargetRepo().checkPort(host, port);
	}

	async checkSsl(host: string): Promise<SslCheckResult> {
		this.checkPermission('network', 'use');
		return this.getTargetRepo().checkSsl(host);
	}
}

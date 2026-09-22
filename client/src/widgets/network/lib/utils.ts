import type { PortCheckResult, ServiceCheckResult, SslCheckResult } from '../model';

export const getResponseTimeClass = (responseTime: number | null) => {
	if (responseTime === null) return 'text-(--color-disabled)';
	if (responseTime < 300) return 'text-(--status-success)';
	if (responseTime < 800) return 'text-(--status-warning)';

	return 'text-(--status-error)';
};

export const getStatusCodeClass = (statusCode: number | null) => {
	if (statusCode === null) return 'text-(--color-disabled)';
	if (statusCode >= 200 && statusCode < 300) return 'text-(--status-success)';
	if (statusCode >= 300 && statusCode < 400) return 'text-(--status-warning)';

	return 'text-(--status-error)';
};

export const getDaysRemaining = (days: number | null) => {
	if (days === null) return 'text-(--color-disabled)';
	if (days <= 7) return 'text-(--status-error)';
	if (days <= 30) return 'text-(--status-warning)';

	return 'text-(--status-success)';
};

export const getUptimeClass = (uptime: number | null) => {
	if (uptime === null) return 'text-(--color-disabled)';
	if (uptime >= 99) return 'text-(--status-success)';
	if (uptime >= 95) return 'text-(--status-warning)';

	return 'text-(--status-error)';
};

export const serviceResultToCopy = (result: ServiceCheckResult) => {
	return [
		`Адрес: ${result.url}`,
		result.ip && `IP: ${result.ip}`,
		`Статус: ${result.status === 'up' ? 'Доступен' : 'Недоступен'}`,
		`HTTP: ${result.statusCode ?? '–'}`,
		`Отклик: ${result.responseTime !== null ? `${result.responseTime} мс` : '–'}`,
	]
		.filter(Boolean)
		.join('\n');
};

export const portResultToCopy = (result: PortCheckResult) => {
	return [
		`Хост: ${result.host}`,
		`IP: ${result.ip}`,
		`Порт: ${result.port}`,
		`Статус: ${result.status === 'open' ? 'Открыт' : 'Закрыт'}`,
		`Отклик: ${result.responseTime !== null ? `${result.responseTime} мс` : '–'}`,
	].join('\n');
};

export const sslResultToCopy = (result: SslCheckResult) => {
	return [
		`Хост: ${result.host}`,
		`IP: ${result.ip}`,
		`Статус: ${result.status === 'valid' ? 'Действителен' : 'Недействителен'}`,
		result.issuer && `Издатель: ${result.issuer}`,
		result.validFrom && `Действует с: ${result.validFrom}`,
		result.validTo && `Действует до: ${result.validTo}`,
		result.daysRemaining !== null && `Осталось дней: ${result.daysRemaining}`,
	]
		.filter(Boolean)
		.join('\n');
};

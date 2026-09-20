export const notificationConfig: Record<string, { source: string }> = {
	'account.password_changed': { source: 'Система' },
	'account.email_changed': { source: 'Система' },
	'account.restored': { source: 'Система' },

	'network.service_down': { source: 'Сеть' },
	'network.service_recovered': { source: 'Сеть' },
};

export const FEATURES = {
	user: ['read', 'save', 'delete'],
	profile: ['read', 'save', 'delete', 'configure'],
	location: ['read', 'save', 'delete'],
	notes: ['read', 'save'],
	activity: ['read', 'save', 'delete'],
	notification: ['read', 'save', 'delete'],
	device: ['read'],
	translator: ['use'],
	kanban: ['read', 'save', 'delete'],
	network: ['read', 'save', 'delete', 'use'],
	cloud: ['read', 'save', 'delete', 'upload', 'use'],
} as const;

export type Role = 'user' | 'demo';
export type Feature = keyof typeof FEATURES;
export type Operation<F extends Feature = Feature> = (typeof FEATURES)[F][number];
type Capabilities = { [F in Feature]: Partial<Record<(typeof FEATURES)[F][number], boolean>> };

export const ACL: Record<Role, Capabilities> = {
	user: {
		user: { read: true, save: true, delete: true },
		profile: { read: true, save: true, delete: true, configure: true },
		location: { read: true, save: true, delete: true },
		notes: { read: true, save: true },
		activity: { read: true, save: true, delete: true },
		notification: { read: true, save: true, delete: true },
		device: { read: true },
		translator: { use: true },
		kanban: { read: true, save: true, delete: true },
		network: { read: true, save: true, delete: true, use: true },
		cloud: { read: true, save: true, delete: true, upload: true, use: true },
	},
	demo: {
		user: { read: true, save: true, delete: true },
		profile: { read: true, save: true, delete: false, configure: false },
		location: { read: true, save: true, delete: true },
		notes: { read: true, save: true },
		activity: { read: true, save: true, delete: true },
		notification: { read: true, save: false, delete: false },
		device: { read: true },
		translator: { use: false },
		kanban: { read: true, save: true, delete: true },
		network: { read: false, save: false, delete: false, use: true },
		cloud: { read: true, save: false, delete: false, upload: false, use: false },
	},
} satisfies Record<Role, Capabilities>;

export class PermissionService {
	static canPerform<F extends Feature>(role: Role, feature: F, operation: Operation<F>) {
		return ACL[role]?.[feature]?.[operation] === true;
	}

	static getFeatureCapabilities<F extends Feature>(role: Role, feature: F) {
		return ACL[role][feature];
	}
}

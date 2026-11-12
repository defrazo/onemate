export const FEATURES = {
	user: ['read', 'save', 'delete'],
	profile: ['read', 'save', 'delete', 'configure'],
	location: ['read', 'save', 'delete'],
	activity: ['read', 'save', 'delete'],
	notification: ['read', 'save', 'delete'],

	notes: ['read', 'save'],
	credentials: ['read', 'save', 'delete'],
	todo: ['read', 'save', 'delete'],
	kanban: ['read', 'save', 'delete'],
	cloud: ['read', 'save', 'delete', 'upload', 'use'],

	device: ['read'],
	translator: ['use'],
	network: ['read', 'save', 'delete', 'use'],
	monitoring: ['read'],
} as const;

export type Role = 'user' | 'demo' | 'admin';
export type Feature = keyof typeof FEATURES;
export type Operation<F extends Feature = Feature> = (typeof FEATURES)[F][number];

type Capabilities = { [F in Feature]: Partial<Record<Operation<F>, boolean>> };

const baseACL = {
	user: {
		user: { read: true, save: true, delete: true },
		profile: { read: true, save: true, delete: true, configure: true },
		location: { read: true, save: true, delete: true },
		activity: { read: true, save: true, delete: true },
		notification: { read: true, save: true, delete: true },

		notes: { read: true, save: true },
		credentials: { read: true, save: true, delete: true },
		todo: { read: true, save: true, delete: true },
		kanban: { read: true, save: true, delete: true },
		cloud: { read: true, save: true, delete: true, upload: true, use: true },

		device: { read: true },
		translator: { use: true },
		network: { read: true, save: true, delete: true, use: true },
		monitoring: { read: false },
	},
	demo: {
		user: { read: false, save: false, delete: false },
		profile: { read: true, save: true, delete: false, configure: false },
		location: { read: true, save: true, delete: true },
		activity: { read: true, save: true, delete: true },
		notification: { read: true, save: false, delete: false },

		notes: { read: true, save: true },
		credentials: { read: true, save: true, delete: true },
		todo: { read: true, save: true, delete: true },
		kanban: { read: true, save: true, delete: true },
		cloud: { read: true, save: false, delete: false, upload: false, use: false },

		device: { read: true },
		translator: { use: false },
		network: { read: false, save: false, delete: false, use: true },
		monitoring: { read: false },
	},
} satisfies Record<Exclude<Role, 'admin'>, Capabilities>;

export const ACL: Record<Role, Capabilities> = { ...baseACL, admin: { ...baseACL.user, monitoring: { read: true } } };

export class PermissionService {
	static canPerform<F extends Feature>(role: Role, feature: F, operation: Operation<F>): boolean {
		return ACL[role][feature][operation] === true;
	}

	static getFeatureCapabilities<F extends Feature>(role: Role, feature: F): Capabilities[F] {
		return ACL[role][feature];
	}
}

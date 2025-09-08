export const FEATURES = {
	user: ['read', 'save', 'delete'],
	profile: ['read', 'save', 'delete'],
	city: ['read', 'save', 'delete'],
	notes: ['read', 'save'],
	activity: ['read', 'save', 'delete'],
	device: ['read'],
	translator: ['use'],
} as const;

export type Role = 'user' | 'demo';
export type Feature = keyof typeof FEATURES;
export type Operation<F extends Feature = Feature> = (typeof FEATURES)[F][number];
type Capabilities = { [F in Feature]: Partial<Record<(typeof FEATURES)[F][number], boolean>> };

export const ACL: Record<Role, Capabilities> = {
	user: {
		user: { read: true, save: true, delete: true },
		profile: { read: true, save: true, delete: true },
		city: { read: true, save: true, delete: true },
		notes: { read: true, save: true },
		activity: { read: true, save: true, delete: true },
		device: { read: true },
		translator: { use: true },
	},
	demo: {
		user: { read: true, save: true, delete: true },
		profile: { read: true, save: true, delete: false },
		city: { read: true, save: true, delete: true },
		notes: { read: true, save: true },
		activity: { read: true, save: true, delete: true },
		device: { read: true },
		translator: { use: false },
	},
} satisfies Record<Role, Capabilities>;

export class PermissionService {
	static canPerform<F extends Feature>(role: Role, feature: F, operation: Operation<F>): boolean {
		return ACL[role]?.[feature]?.[operation] === true;
	}

	static getFeatureCapabilities<F extends Feature>(role: Role, feature: F) {
		return ACL[role][feature];
	}
}

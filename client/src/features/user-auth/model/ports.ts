export interface IAuthAccountPort {
	readonly isReady: boolean;
	logout(): void;
}

export interface IAuthDevicePort {
	readonly isReady: boolean;
	readonly lastAuthTime: number;
}

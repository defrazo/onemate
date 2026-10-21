import type { City } from '@/entities/city';

export interface IBaseUserLocationPort {
	readonly isReady: boolean;
	readonly location: City | null;
}

export interface IUserLocationProfilePort extends IBaseUserLocationPort {
	readonly name: string;
	readonly region: string;

	setLocation(city: City): void;
	deleteLocation(): void;
}

export interface IUserLocationWeatherPort extends IBaseUserLocationPort {
	readonly name: string;

	setLocation(city: City): void;
}

export interface IUserLocationRepo {
	load(userId: string): Promise<City | null>;
	save(userId: string, city: City): Promise<void>;
	delete(userId: string): Promise<void>;
}

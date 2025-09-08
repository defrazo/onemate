import type { City } from '.';

export interface IBaseCityPort {
	readonly isReady: boolean;
	readonly name: string;
}

export interface ICityDeviceActivityPort extends IBaseCityPort {
	readonly city: City;
}

export interface ICityLocationPort extends IBaseCityPort {
	setCity(city: City): void;
}

export interface ICityRepo {
	loadCity(id: string): Promise<City>;
	saveCity(id: string, city: City): Promise<void>;
	deleteCity(id: string): Promise<void>;
}

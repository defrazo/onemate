import type { City } from '@/entities/city';
import { api } from '@/shared/api';

import type { IUserLocationRepo, UserLocationType } from '../../model';

type DbUserLocation = {
	id: number;
	user_id: string;
	type: UserLocationType;
	name: string;
	region: string | null;
	country: string;
	lat: number;
	lon: number;
	created_at: string;
	updated_at: string;
};

type LocationResponse = {
	location: DbUserLocation | null;
};

const mapLocation = (location: DbUserLocation): City => ({
	name: location.name,
	region: location.region ?? undefined,
	country: location.country,
	lat: location.lat,
	lon: location.lon,
});

export class UserLocationRepoLaravel implements IUserLocationRepo {
	constructor(private readonly type: UserLocationType) {}

	async load(_userId: string): Promise<City | null> {
		const { data } = await api.get<LocationResponse>(`/user/locations/${this.type}`);
		return data.location ? mapLocation(data.location) : null;
	}

	async save(_userId: string, city: City): Promise<void> {
		await api.put(`/user/locations/${this.type}`, {
			name: city.name,
			region: city.region ?? null,
			country: city.country,
			lat: city.lat,
			lon: city.lon,
		});
	}

	async delete(_userId: string): Promise<void> {
		await api.delete(`/user/locations/${this.type}`);
	}
}

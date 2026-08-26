import { api } from '@/shared/api';

import type { City, ICityRepo } from '../../model';

type CityResponse = {
	city: City;
};

export class CityRepoLaravel implements ICityRepo {
	async loadCity(_id: string): Promise<City> {
		const { data } = await api.get<CityResponse>('/user/city');
		return data.city;
	}

	async saveCity(_id: string, city: City): Promise<void> {
		await api.put('/user/city', {
			name: city.name,
			region: city.region ?? null,
			country: city.country,
			lat: city.lat,
			lon: city.lon,
		});
	}

	async deleteCity(_id: string): Promise<void> {
		await api.delete('/user/city');
	}
}

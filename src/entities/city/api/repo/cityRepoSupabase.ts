import type { City, ICityRepo } from '../../model';
import { cityService } from '../../model';

export class CityRepoSupabase implements ICityRepo {
	async loadCity(id: string): Promise<City> {
		return cityService.loadCity(id);
	}

	async saveCity(id: string, city: City): Promise<void> {
		return cityService.saveCity(id, city);
	}

	async deleteCity(id: string): Promise<void> {
		return cityService.deleteCity(id);
	}
}

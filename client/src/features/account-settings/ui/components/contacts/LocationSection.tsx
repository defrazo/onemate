import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { City, isSameCity } from '@/entities/city';
import LocationSearch from '@/features/location-search';
import { Collapse } from '@/shared/ui';

import { FormActions } from '..';

export const LocationSection = observer(() => {
	const { notifyStore, userProfileStore } = useStore();

	const [location, setLocation] = useState<City | null>(userProfileStore.location);
	const [isLoading, setIsLoading] = useState(false);

	const savedLocation = userProfileStore.location;

	const isChanged =
		location === null ? savedLocation !== null : savedLocation === null || !isSameCity(location, savedLocation);

	const handleCancel = (): void => setLocation(userProfileStore.location);

	const handleSave = async (): Promise<void> => {
		if (isLoading || !isChanged) return;

		try {
			setIsLoading(true);

			if (location) {
				userProfileStore.setLocation(location);
				notifyStore.setNotice('Местоположение сохранено', 'success');
			} else {
				await userProfileStore.deleteLocation();
				notifyStore.setNotice('Местоположение удалено', 'success');
			}

			setLocation(userProfileStore.location);
		} catch {
			notifyStore.setNotice('Не удалось сохранить местоположение', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-1">
			<label className="text-(--color-secondary) opacity-70" htmlFor="location">
				Город
			</label>
			<LocationSearch value={location} onRemove={() => setLocation(null)} onSelect={setLocation} />
			<Collapse open={isChanged}>
				<FormActions isLoading={isLoading} onCancel={handleCancel} onSave={handleSave} />
			</Collapse>
		</div>
	);
});

import { observer } from 'mobx-react-lite';

import { IconLocation } from '@/shared/assets/icons';
import { Button, Preloader, Tooltip } from '@/shared/ui';

import { cityStore } from '../model';

const CityLocation = () => {
	return (
		<div className="absolute top-1 right-1">
			<Tooltip className="group" text="Определить мое местоположение">
				{cityStore.isLoading ? (
					<Preloader className="h-8 w-8" />
				) : (
					<Button
						className="hover:text-[var(--accent-hover)]"
						rightIcon={<IconLocation className="h-8 w-8" />}
						size="custom"
						variant="custom"
						onClick={() => cityStore.detectCityByGeolocation()}
					></Button>
				)}
			</Tooltip>
		</div>
	);
};

export default observer(CityLocation);

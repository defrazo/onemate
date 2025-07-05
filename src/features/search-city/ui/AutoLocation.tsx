import { observer } from 'mobx-react-lite';

import { cityStore } from '@/entities/city/model';
import { IconLocation } from '@/shared/assets/icons';
import { Button, Preloader, Tooltip } from '@/shared/ui';

export const AutoLocation = observer(() => {
	return (
		<div className="absolute top-[1px] right-[1px] z-10 size-10">
			<Tooltip className="group flex size-full items-center justify-center" text="Определить мое местоположение">
				{cityStore.isLoading ? (
					<Preloader className="size-7" />
				) : (
					<Button
						centerIcon={<IconLocation className="size-8" />}
						className="size-full hover:text-[var(--accent-hover)]"
						size="custom"
						variant="custom"
						onClick={() => cityStore.detectCityByGeolocation()}
					/>
				)}
			</Tooltip>
		</div>
	);
});

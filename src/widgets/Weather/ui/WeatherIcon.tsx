import { observer } from 'mobx-react-lite';

import { uiStore } from '@/shared/stores';

import { weatherIcons } from '../lib';
import type { WeatherCode } from '../model';

interface WeatherIconProps {
	condition: WeatherCode;
	description: string;
	className?: string;
}

export const WeatherIcon = observer(
	({ condition, description, className = 'size-full text-[var(--color-primary)]' }: WeatherIconProps) => {
		const theme = uiStore.theme;
		const icon = weatherIcons[theme][condition] || weatherIcons[theme].default;

		return <img alt={description} className={className} height="100%" src={icon} width="100%" />;
	}
);

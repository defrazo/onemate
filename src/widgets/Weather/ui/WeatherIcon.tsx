import { observer } from 'mobx-react-lite';

import { appStore } from '@/shared/store/appStore';

import { weatherIcons } from '../lib';
import type { WeatherCode } from '../model';

interface WeatherIconProps {
	condition: WeatherCode;
	description: string;
	className?: string;
}

const WeatherIcon = ({
	condition,
	description,
	className = 'size-full text-[var(--color-primary)]',
}: WeatherIconProps) => {
	const theme = appStore.theme;
	const icon = weatherIcons[theme][condition] || weatherIcons[theme].default;

	return <img alt={description} className={className} height="100%" src={icon} width="100%" />;
};

export default observer(WeatherIcon);

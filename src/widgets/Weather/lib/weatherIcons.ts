import Icon01dDark from '@/shared/assets/icons/weather/dark/01d.svg';
import Icon01nDark from '@/shared/assets/icons/weather/dark/01n.svg';
import Icon02dDark from '@/shared/assets/icons/weather/dark/02d.svg';
import Icon02nDark from '@/shared/assets/icons/weather/dark/02n.svg';
import Icon03dDark from '@/shared/assets/icons/weather/dark/03d.svg';
import Icon03nDark from '@/shared/assets/icons/weather/dark/03n.svg';
import Icon04dDark from '@/shared/assets/icons/weather/dark/04d.svg';
import Icon04nDark from '@/shared/assets/icons/weather/dark/04n.svg';
import Icon09dDark from '@/shared/assets/icons/weather/dark/09d.svg';
import Icon09nDark from '@/shared/assets/icons/weather/dark/09n.svg';
import Icon10dDark from '@/shared/assets/icons/weather/dark/10d.svg';
import Icon10nDark from '@/shared/assets/icons/weather/dark/10n.svg';
import Icon11dDark from '@/shared/assets/icons/weather/dark/11d.svg';
import Icon11nDark from '@/shared/assets/icons/weather/dark/11n.svg';
import Icon13dDark from '@/shared/assets/icons/weather/dark/13d.svg';
import Icon13nDark from '@/shared/assets/icons/weather/dark/13n.svg';
import Icon50dDark from '@/shared/assets/icons/weather/dark/50d.svg';
import Icon50nDark from '@/shared/assets/icons/weather/dark/50n.svg';
import UnknownDark from '@/shared/assets/icons/weather/dark/unknown.svg';
import Icon01dLight from '@/shared/assets/icons/weather/light/01d.svg';
import Icon01nLight from '@/shared/assets/icons/weather/light/01n.svg';
import Icon02dLight from '@/shared/assets/icons/weather/light/02d.svg';
import Icon02nLight from '@/shared/assets/icons/weather/light/02n.svg';
import Icon03dLight from '@/shared/assets/icons/weather/light/03d.svg';
import Icon03nLight from '@/shared/assets/icons/weather/light/03n.svg';
import Icon04dLight from '@/shared/assets/icons/weather/light/04d.svg';
import Icon04nLight from '@/shared/assets/icons/weather/light/04n.svg';
import Icon09dLight from '@/shared/assets/icons/weather/light/09d.svg';
import Icon09nLight from '@/shared/assets/icons/weather/light/09n.svg';
import Icon10dLight from '@/shared/assets/icons/weather/light/10d.svg';
import Icon10nLight from '@/shared/assets/icons/weather/light/10n.svg';
import Icon11dLight from '@/shared/assets/icons/weather/light/11d.svg';
import Icon11nLight from '@/shared/assets/icons/weather/light/11n.svg';
import Icon13dLight from '@/shared/assets/icons/weather/light/13d.svg';
import Icon13nLight from '@/shared/assets/icons/weather/light/13n.svg';
import Icon50dLight from '@/shared/assets/icons/weather/light/50d.svg';
import Icon50nLight from '@/shared/assets/icons/weather/light/50n.svg';
import UnknownLight from '@/shared/assets/icons/weather/light/unknown.svg';

import type { WeatherCode } from '../model';

export const weatherIcons: Record<'light' | 'dark', Record<WeatherCode, string> & { default: string }> = {
	light: {
		'01d': Icon01dLight,
		'01n': Icon01nLight,
		'02d': Icon02dLight,
		'02n': Icon02nLight,
		'03d': Icon03dLight,
		'03n': Icon03nLight,
		'04d': Icon04dLight,
		'04n': Icon04nLight,
		'09d': Icon09dLight,
		'09n': Icon09nLight,
		'10d': Icon10dLight,
		'10n': Icon10nLight,
		'11d': Icon11dLight,
		'11n': Icon11nLight,
		'13d': Icon13dLight,
		'13n': Icon13nLight,
		'50d': Icon50dLight,
		'50n': Icon50nLight,
		default: UnknownLight,
	},
	dark: {
		'01d': Icon01dDark,
		'01n': Icon01nDark,
		'02d': Icon02dDark,
		'02n': Icon02nDark,
		'03d': Icon03dDark,
		'03n': Icon03nDark,
		'04d': Icon04dDark,
		'04n': Icon04nDark,
		'09d': Icon09dDark,
		'09n': Icon09nDark,
		'10d': Icon10dDark,
		'10n': Icon10nDark,
		'11d': Icon11dDark,
		'11n': Icon11nDark,
		'13d': Icon13dDark,
		'13n': Icon13nDark,
		'50d': Icon50dDark,
		'50n': Icon50nDark,
		default: UnknownDark,
	},
};

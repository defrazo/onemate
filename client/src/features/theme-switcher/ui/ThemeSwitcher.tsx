import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Day, Night } from '@/shared/assets/images';

const ThemeSwitcher = () => {
	const { themeStore } = useStore();

	const isDark = themeStore.theme === 'dark';
	const alt = isDark ? 'Светлая тема' : 'Темная тема';
	const image = isDark ? Day : Night;
	const title = isDark ? 'Активировать светлую тему' : 'Активировать темную тему';

	return (
		<button className="size-7 cursor-pointer" title={title} type="button" onClick={() => themeStore.toggleTheme()}>
			<img alt={alt} decoding="async" src={image} />
		</button>
	);
};

export default observer(ThemeSwitcher);

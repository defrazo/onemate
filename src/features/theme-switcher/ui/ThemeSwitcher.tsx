import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Day, Night } from '@/shared/assets/images';

const ThemeSwitcher = () => {
	const { themeStore } = useStore();

	const isDark = themeStore.theme === 'dark';
	const alt = isDark ? 'Светлая тема' : 'Темная тема';
	const image = isDark ? Day : Night;
	const title = isDark ? 'Активировать светлую тему' : 'Активировать темную тему';
	const handleToogle = () => themeStore.toggleTheme();

	return (
		<div className="hidden size-7 md:flex">
			<img alt={alt} className="cursor-pointer" src={image} title={title} onClick={handleToogle} />
		</div>
	);
};

export default observer(ThemeSwitcher);

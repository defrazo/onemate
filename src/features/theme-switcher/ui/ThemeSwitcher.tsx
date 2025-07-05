import { observer } from 'mobx-react-lite';

import { Day, Night } from '@/shared/assets/images';
import { uiStore } from '@/shared/stores';

const ThemeSwitcher = () => {
	const isDark = uiStore.theme === 'dark';
	const alt = isDark ? 'Светлая тема' : 'Темная тема';
	const image = isDark ? Day : Night;
	const title = isDark ? 'Активировать светлую тему' : 'Активировать темную тему';
	const handleToogle = () => uiStore.toggleTheme();

	return (
		<div className="hidden size-7 md:flex">
			<img alt={alt} className="cursor-pointer" src={image} title={title} onClick={handleToogle} />
		</div>
	);
};

export default observer(ThemeSwitcher);

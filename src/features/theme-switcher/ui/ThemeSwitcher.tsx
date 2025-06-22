import { observer } from 'mobx-react-lite';

import { Day, Night } from '@/shared/assets/images';
import { uiStore } from '@/shared/stores';

const ThemeSwitcher = () => {
	return (
		<div className="hidden h-7 md:flex">
			{uiStore.theme === 'dark' ? (
				<img alt="Светлая тема" className="cursor-pointer" src={Day} onClick={() => uiStore.toggleTheme()} />
			) : (
				<img alt="Темная тема" className="cursor-pointer" src={Night} onClick={() => uiStore.toggleTheme()} />
			)}
		</div>
	);
};

export default observer(ThemeSwitcher);

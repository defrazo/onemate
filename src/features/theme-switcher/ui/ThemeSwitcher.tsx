import { observer } from 'mobx-react-lite';

import { Day, Night } from '@/shared/assets/images';
import { appStore } from '@/shared/store/appStore';

const ThemeSwitcher = () => {
	return (
		<div className="hidden h-7 md:flex">
			{appStore.theme === 'dark' ? (
				<img alt="Светлая тема" className="cursor-pointer" src={Day} onClick={() => appStore.toggleTheme()} />
			) : (
				<img alt="Темная тема" className="cursor-pointer" src={Night} onClick={() => appStore.toggleTheme()} />
			)}
		</div>
	);
};

export default observer(ThemeSwitcher);

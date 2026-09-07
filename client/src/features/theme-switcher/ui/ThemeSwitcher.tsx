import { IconMoon, IconSun } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

export const ThemeSwitcher = observer(() => {
	const { themeStore } = useStore();

	const isDark = themeStore.theme === 'dark';
	const title = isDark ? 'Активировать светлую тему' : 'Активировать темную тему';

	return (
		<button
			className="group flex size-9 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-white/10"
			title={title}
			type="button"
			onClick={() => themeStore.toggleTheme()}
		>
			{isDark ? (
				<IconSun className="size-5.5 text-orange-400 transition-transform group-hover:scale-115" stroke={2} />
			) : (
				<IconMoon className="size-5.5 text-sky-700 transition-transform group-hover:scale-115" stroke={2} />
			)}
		</button>
	);
});

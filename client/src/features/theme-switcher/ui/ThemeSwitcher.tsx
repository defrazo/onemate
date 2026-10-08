import { IconMoonFilled, IconSunFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button } from '@/shared/ui';

export const ThemeSwitcher = observer(() => {
	const { themeStore } = useStore();

	const isDark = themeStore.theme === 'dark';
	const title = isDark ? 'Активировать светлую тему' : 'Активировать темную тему';
	const style = 'size-5.5 shrink-0 text-(--accent-primary) transition-transform group-hover:scale-115';

	return (
		<Button
			centerIcon={isDark ? <IconSunFilled className={style} /> : <IconMoonFilled className={style} />}
			className="group size-9"
			title={title}
			type="button"
			variant="iconSurface"
			onClick={() => themeStore.toggleTheme()}
		/>
	);
});

import { Icon, IconMoonFilled, IconSunFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import type { Theme } from '@/shared/config';
import { cn } from '@/shared/lib/utils';

const themes = [
	{ value: 'light', label: 'Светлая', icon: IconSunFilled },
	{ value: 'dark', label: 'Тёмная', icon: IconMoonFilled },
] satisfies { value: Theme; label: string; icon: Icon }[];

export const AppearanceSection = observer(() => {
	const { userProfileStore } = useStore();

	const handleThemeChange = (theme: Theme) => void userProfileStore.updateTheme(theme);

	return (
		<section className="flex items-center justify-between select-none">
			<span className="text-sm text-(--color-secondary) opacity-70 xl:text-base">Тема интерфейса</span>
			<div className="flex w-fit gap-1 rounded-xl bg-(--bg-tertiary) p-1 xl:w-52">
				{themes.map(({ value, label, icon: Icon }) => {
					const isActive = userProfileStore.theme === value;
					return (
						<button
							key={value}
							className={cn(
								'flex h-8 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm transition',
								isActive
									? 'bg-(--accent-default) text-(--color-primary)'
									: 'hover:text-(--accent-default)'
							)}
							type="button"
							onClick={() => handleThemeChange(value)}
						>
							<Icon className="size-4" />
							<span className="trim">{label}</span>
						</button>
					);
				})}
			</div>
		</section>
	);
});

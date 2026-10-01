import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

export const ViewSwitch = observer(() => {
	const { weatherStore } = useStore();

	const buttonStyle = (active: boolean) =>
		cn(
			'flex-1 rounded-md px-3 text-sm',
			active
				? 'bg-(--accent-primary) text-(--text-primary)'
				: 'text-(--accent-primary)/80 hover:text-(--accent-primary)'
		);

	return (
		<div className="mx-auto flex h-7 w-60 shrink-0 gap-0.5 rounded-lg bg-(--accent-primary)/10 p-0.5">
			<Button
				className={buttonStyle(weatherStore.isOpenCurrent)}
				size="custom"
				type="button"
				variant="custom"
				onClick={() => !weatherStore.isOpenCurrent && weatherStore.toggleView()}
			>
				Сейчас
			</Button>
			<Button
				className={buttonStyle(!weatherStore.isOpenCurrent)}
				size="custom"
				type="button"
				variant="custom"
				onClick={() => weatherStore.isOpenCurrent && weatherStore.toggleView()}
			>
				5 дней
			</Button>
		</div>
	);
});

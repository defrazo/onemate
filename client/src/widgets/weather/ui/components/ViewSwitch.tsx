import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';

export const ViewSwitch = observer(() => {
	const { weatherStore } = useStore();

	return (
		<div className="mx-auto flex h-7 w-60 gap-0.5 rounded-lg bg-(--accent-default)/10 p-0.5">
			<button
				className={cn(
					'flex-1 cursor-pointer rounded-md px-3 text-sm transition-colors',
					weatherStore.isOpenCurrent
						? 'bg-(--accent-default) text-(--color-primary)'
						: 'text-(--accent-default) hover:bg-(--accent-default)/20'
				)}
				type="button"
				onClick={() => !weatherStore.isOpenCurrent && weatherStore.toggleView()}
			>
				Сейчас
			</button>
			<button
				className={cn(
					'flex-1 cursor-pointer rounded-md px-3 text-sm transition-colors',
					!weatherStore.isOpenCurrent
						? 'bg-(--accent-default) text-(--color-primary)'
						: 'text-(--accent-default) hover:bg-(--accent-default)/20'
				)}
				type="button"
				onClick={() => weatherStore.isOpenCurrent && weatherStore.toggleView()}
			>
				5 дней
			</button>
		</div>
	);
});

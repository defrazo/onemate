import { cn } from '@/shared/lib/utils';

type NetworkView = 'monitoring' | 'tools';

interface ViewSwitchProps {
	view: NetworkView;
	onChange: (view: NetworkView) => void;
}

export const ViewSwitch = ({ view, onChange }: ViewSwitchProps) => {
	return (
		<div className="mx-auto flex h-7 w-60 shrink-0 gap-0.5 rounded-lg bg-(--accent-default)/10 p-0.5">
			<button
				className={cn(
					'flex-1 cursor-pointer rounded-md px-3 text-sm transition-colors',
					view === 'monitoring'
						? 'bg-(--accent-default) text-(--color-primary)'
						: 'text-(--accent-default) hover:bg-(--accent-default)/20'
				)}
				type="button"
				onClick={() => onChange('monitoring')}
			>
				Мониторинг
			</button>

			<button
				className={cn(
					'flex-1 cursor-pointer rounded-md px-3 text-sm transition-colors',
					view === 'tools'
						? 'bg-(--accent-default) text-(--color-primary)'
						: 'text-(--accent-default) hover:bg-(--accent-default)/20'
				)}
				type="button"
				onClick={() => onChange('tools')}
			>
				Инструменты
			</button>
		</div>
	);
};

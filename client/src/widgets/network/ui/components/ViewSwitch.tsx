import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import type { NetworkView } from '../../model';

interface ViewSwitchProps {
	view: NetworkView;
	onChange: (view: NetworkView) => void;
}

export const ViewSwitch = ({ view, onChange }: ViewSwitchProps) => {
	const buttonStyle = (active: boolean) =>
		cn(
			'flex-1 rounded-md px-3 text-sm',
			active
				? 'bg-(--accent-default) text-(--color-primary)'
				: 'text-(--accent-default)/80 hover:text-(--accent-default)'
		);

	return (
		<div className="mx-auto flex h-7 w-60 shrink-0 gap-0.5 rounded-lg bg-(--accent-default)/10 p-0.5">
			<Button
				className={buttonStyle(view === 'monitoring')}
				size="custom"
				type="button"
				variant="custom"
				onClick={() => onChange('monitoring')}
			>
				Мониторинг
			</Button>
			<Button
				className={buttonStyle(view === 'tools')}
				size="custom"
				type="button"
				variant="custom"
				onClick={() => onChange('tools')}
			>
				Инструменты
			</Button>
		</div>
	);
};

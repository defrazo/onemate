import type { TodoCanvas } from '@/entities/todo';
import { useResponsive } from '@/shared/lib/hooks';
import { Select } from '@/shared/ui';

interface ListSwitcherProps {
	canvases: TodoCanvas[];
	value: string;
	disabled: boolean;
	onChange: (value: string) => void;
}

export const ListSwitcher = ({ canvases, value, disabled, onChange }: ListSwitcherProps) => {
	const { isMobile } = useResponsive();

	const options = canvases.flatMap((canvas) =>
		canvas.lists.map((list) => ({ key: canvas.title, value: list.id, label: list.title }))
	);

	return (
		<div className="flex min-w-0 items-center gap-2">
			<span className="shrink-0 text-sm text-(--text-secondary)">{isMobile ? 'Список:' : 'Текущий список:'}</span>
			<div className="min-w-0 flex-1">
				<Select
					align="start"
					className="min-w-40 border-0 text-sm font-medium"
					disabled={disabled}
					listClassName="min-w-40"
					options={options}
					value={value}
					variant="tone"
					onChange={onChange}
				/>
			</div>
		</div>
	);
};

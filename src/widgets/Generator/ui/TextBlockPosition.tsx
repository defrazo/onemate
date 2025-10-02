import { useStore } from '@/app/providers';
import { Input } from '@/shared/ui';

interface TextBlockPositionProps {
	position: number[];
	maxX: number;
	maxY: number;
	onChange: (axis: 'x' | 'y', value: number) => void;
}

export const TextBlockPosition = ({ position, maxX, maxY, onChange }: TextBlockPositionProps) => {
	const { genStore } = useStore();

	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center justify-between">
				<label className="select-none">Позиция:</label>
				<span
					className={`text-xs ${!genStore.svgWithText ? 'text-[var(--color-disabled)] opacity-30' : 'text-[var(--color-secondary)]'}`}
				>
					X ({position[0].toFixed(1)}), Y ({position[1].toFixed(1)})
				</span>
			</div>
			<div className="flex items-center gap-2">
				<label className="whitespace-nowrap select-none">По X:</label>
				<Input
					className="accent-[var(--accent-default)]"
					disabled={!genStore.svgWithText}
					max={maxX}
					min={0}
					type="range"
					value={position[0]}
					variant="custom"
					onChange={(e) => onChange('x', parseFloat(e.target.value))}
				/>
			</div>
			<div className="flex items-center gap-2">
				<label className="whitespace-nowrap select-none">По Y:</label>
				<Input
					disabled={!genStore.svgWithText}
					max={maxY}
					className="accent-[var(--accent-default)]"
					min={0}
					type="range"
					value={position[1]}
					variant="custom"
					size="custom"
					onChange={(e) => onChange('y', parseFloat(e.target.value))}
				/>
			</div>
		</div>
	);
};

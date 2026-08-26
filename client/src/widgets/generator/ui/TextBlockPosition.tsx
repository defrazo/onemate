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
				<span className="select-none">Позиция:</span>
				<span
					className={`text-xs ${!genStore.svgWithText ? 'text-(--color-disabled) opacity-30' : 'text-(--color-secondary)'}`}
				>
					X ({position[0].toFixed(1)}), Y ({position[1].toFixed(1)})
				</span>
			</div>
			<div className="flex items-center gap-2">
				<span className="whitespace-nowrap select-none">По X:</span>
				<Input
					className="accent-(--accent-default)"
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
				<span className="whitespace-nowrap select-none">По Y:</span>
				<Input
					className="accent-(--accent-default)"
					disabled={!genStore.svgWithText}
					max={maxY}
					min={0}
					size="custom"
					type="range"
					value={position[1]}
					variant="custom"
					onChange={(e) => onChange('y', parseFloat(e.target.value))}
				/>
			</div>
		</div>
	);
};

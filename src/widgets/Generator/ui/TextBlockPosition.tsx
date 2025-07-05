import { Input } from '@/shared/ui';

import { genStore } from '../model';

interface TextBlockPositionProps {
	label: string;
	position: number[];
	maxX: number;
	maxY: number;
	onChange: (axis: 'x' | 'y', value: number) => void;
}

export const TextBlockPosition = ({ label, position, maxX, maxY, onChange }: TextBlockPositionProps) => (
	<label className="flex w-full flex-col gap-1">
		<div className="flex items-center justify-between gap-1">
			{label}
			<span className="text-xs text-[var(--color-disabled)]">
				X ({position[0].toFixed(1)}), Y ({position[1].toFixed(1)})
			</span>
		</div>
		<div className="flex w-full items-center gap-2">
			<span className="whitespace-nowrap">По X:</span>
			<Input
				className="w-full"
				disabled={!genStore.svgWithText}
				max={maxX}
				min={0}
				type="range"
				value={position[0]}
				variant="custom"
				onChange={(e) => onChange('x', parseFloat(e.target.value))}
			/>
		</div>
		<div className="flex w-full items-center gap-2">
			<span className="whitespace-nowrap">По Y:</span>
			<Input
				className="w-full"
				disabled={!genStore.svgWithText}
				max={maxY}
				min={0}
				type="range"
				value={position[1]}
				variant="custom"
				onChange={(e) => onChange('y', parseFloat(e.target.value))}
			/>
		</div>
	</label>
);

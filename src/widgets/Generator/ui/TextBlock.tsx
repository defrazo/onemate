import type { ChangeEvent } from 'react';

import { useStore } from '@/app/providers';
import { CheckboxBool, Divider, Input } from '@/shared/ui';

import { TextBlockPosition } from '.';

interface TextBlockProps {
	label: string;
	textValue: string;
	isChecked: boolean;
	position: number[];
	onCheckToggle: () => void;
	onTextChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onPositionChange: (axis: 'x' | 'y', value: number) => void;
}

export const TextBlock = ({
	label,
	textValue,
	isChecked,
	position,
	onCheckToggle,
	onTextChange,
	onPositionChange,
}: TextBlockProps) => {
	const { genStore } = useStore();

	return (
		<div className="core-border flex flex-col gap-1 rounded-xl p-2">
			<label className="flex w-full flex-col gap-1">
				<div className="flex items-center justify-between">
					<span>{label}</span>
					<CheckboxBool
						checked={isChecked}
						className="h-5"
						disabled={!genStore.svgWithText}
						onChange={onCheckToggle}
					/>
				</div>
				<div className="w-full">
					<Input
						className="rounded-xl text-center"
						disabled={!genStore.svgWithText}
						size="sm"
						type="text"
						value={textValue}
						onChange={onTextChange}
					/>
				</div>
			</label>
			<Divider />
			<TextBlockPosition
				label="Позиция:"
				maxX={genStore.width}
				maxY={genStore.height}
				position={position}
				onChange={onPositionChange}
			/>
		</div>
	);
};

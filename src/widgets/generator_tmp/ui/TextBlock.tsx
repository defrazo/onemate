import type { ChangeEvent } from 'react';

import { useStore } from '@/app/providers';
import { CheckboxBool, Input } from '@/shared/ui';

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
		<div className="core-border flex flex-col gap-2 p-2">
			<div className="flex items-center justify-between">
				<label className="select-none" htmlFor={`${label}`}>
					{label}
				</label>
				<CheckboxBool
					checked={isChecked}
					className="h-5 bg-transparent"
					disabled={!genStore.svgWithText}
					id={`${label}`}
					onChange={onCheckToggle}
				/>
			</div>
			<Input
				className="core-border text-center leading-4"
				disabled={!genStore.svgWithText}
				name={`${label}`}
				size="sm"
				type="text"
				value={textValue}
				onChange={onTextChange}
			/>
			<TextBlockPosition
				maxX={genStore.width}
				maxY={genStore.height}
				position={position}
				onChange={onPositionChange}
			/>
		</div>
	);
};

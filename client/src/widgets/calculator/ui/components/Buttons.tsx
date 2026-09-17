import {
	IconBackspaceFilled,
	IconDecimal,
	IconDivide,
	IconEqual,
	IconMinus,
	IconPercentage,
	IconPlus,
	IconPlusMinus,
	IconX,
} from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { buttons, type ButtonValue } from '../../model';

const getButtonContent = (value: ButtonValue, label?: string) => {
	switch (value) {
		case 'backspace':
			return <IconBackspaceFilled className="size-4" />;
		case 'plusMinus':
			return <IconPlusMinus className="size-4" />;
		case 'decimal':
			return <IconDecimal className="size-6" />;
		case 'percent':
			return <IconPercentage className="size-4" />;
		case 'divide':
			return <IconDivide className="size-4" />;
		case 'multi':
			return <IconX className="size-4" />;
		case 'minus':
			return <IconMinus className="size-4" />;
		case 'plus':
			return <IconPlus className="size-4" />;
		case 'equal':
			return <IconEqual className="size-4" />;
		default:
			return label;
	}
};

export const Buttons = ({ onClick }: { onClick: (value: ButtonValue) => void }) => {
	return (
		<div className="my-auto grid grid-cols-4 gap-x-2 gap-y-2.5 xl:w-[70%]">
			{buttons.map(({ value, label, type, colSpan = 1 }) => (
				<Button
					key={value}
					className={cn(
						'h-7 rounded-lg border border-(--border-light) text-base',
						colSpan === 2 ? 'col-span-2' : 'col-span-1',
						type === 'digit'
							? 'bg-(--bg-tertiary)'
							: type === 'operator'
								? 'bg-(--bg-tertiary-op)'
								: 'bg-(--accent-default) text-(--accent-text)'
					)}
					size="custom"
					onClick={() => onClick(value)}
				>
					{getButtonContent(value, label)}
				</Button>
			))}
		</div>
	);
};

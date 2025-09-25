import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { calculatorButtons } from '../lib';

interface CalculatorButtonsProps {
	onClick: (value: string) => void;
}

export const CalculatorButtons = ({ onClick }: CalculatorButtonsProps) => {
	return (
		<div className="grid flex-1 grid-cols-4 gap-2">
			{calculatorButtons.map(({ label, colSpan = 1 }) => (
				<Button
					key={label}
					className={cn('py-1.5 text-base md:py-0', colSpan === 2 ? 'col-span-2' : 'col-span-1')}
					size="custom"
					onClick={() => onClick(label)}
				>
					{label}
				</Button>
			))}
		</div>
	);
};

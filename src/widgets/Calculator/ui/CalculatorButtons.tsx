import { Button } from '@/shared/ui';

import { calculatorButtons } from '../lib';

interface CalculatorButtonsProps {
	onClick: (value: string) => void;
}

export const CalculatorButtons = ({ onClick }: CalculatorButtonsProps) => {
	return (
		<div className="grid grid-cols-4 gap-2">
			{calculatorButtons.map(({ label, colSpan = 1 }) => (
				<Button
					key={label}
					className={colSpan === 2 ? 'col-span-2' : 'col-span-1'}
					size="sm"
					onClick={() => onClick(label)}
				>
					{label}
				</Button>
			))}
		</div>
	);
};

import { Button } from '@/shared/ui';

import { calculatorButtons } from '../lib';

interface CalculatorButtonsProps {
	onClick: (value: string) => void;
}

export const CalculatorButtons = ({ onClick }: CalculatorButtonsProps) => {
	return (
		<div className="grid grid-cols-4 gap-2">
			{calculatorButtons.map(({ label, colSpan = 1 }) => (
				<Button key={label} className={`col-span-${colSpan}`} size="sm" onClick={() => onClick(label)}>
					{label}
				</Button>
			))}
		</div>
	);
};

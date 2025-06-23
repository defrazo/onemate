import { forwardRef } from 'react';

import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/ui';

import { useCalculator } from '../model';
import { CalculatorButtons, CalculatorLog } from '.';

interface CalculatorWidgetProps {
	className?: string;
}

const CalculatorWidget = forwardRef<HTMLDivElement, CalculatorWidgetProps>((props, ref) => {
	const { display, handleButtonClick, result } = useCalculator();

	return (
		<div
			ref={ref}
			{...props}
			className={cn(
				'core-base core-card flex w-full flex-2 flex-col gap-2 shadow-[var(--shadow-card)]',
				props.className
			)}
		>
			<h1 className="core-header">Калькулятор</h1>
			<Input
				className="pointer-events-none px-2 text-right text-2xl"
				readOnly
				tabIndex={-1}
				type="text"
				value={display}
				variant="ghost"
			/>
			<CalculatorButtons onClick={handleButtonClick} />
			<CalculatorLog result={result} />
		</div>
	);
});

export default CalculatorWidget;

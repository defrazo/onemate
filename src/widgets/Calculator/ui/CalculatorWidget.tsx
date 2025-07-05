import { Input } from '@/shared/ui';

import { useCalculator } from '../model';
import { CalculatorButtons, CalculatorLog } from '.';

const CalculatorWidget = () => {
	const { display, handleButtonClick, result } = useCalculator();

	return (
		<div className="core-base core-card flex h-full w-full flex-col gap-2 shadow-[var(--shadow-card)]">
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
};

export default CalculatorWidget;

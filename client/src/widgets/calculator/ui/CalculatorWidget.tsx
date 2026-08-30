import { Input, Tooltip } from '@/shared/ui';

import { CALCULATOR_TIP, useCalculator } from '../model';
import { CalculatorButtons, CalculatorLog } from '.';

const CalculatorWidget = () => {
	const { display, handleButtonClick, result } = useCalculator();

	return (
		<>
			<div className="flex items-center">
				<Tooltip content={CALCULATOR_TIP}>
					<h1 className="core-header">Калькулятор</h1>
				</Tooltip>
			</div>
			<Input
				className="pointer-events-none px-2 text-right text-2xl"
				name="calc-output"
				readOnly
				tabIndex={-1}
				type="text"
				value={display}
				variant="ghost"
			/>
			<div className="flex h-full flex-col gap-2 xl:flex-row">
				<CalculatorButtons onClick={handleButtonClick} />
				<CalculatorLog result={result} />
			</div>
		</>
	);
};

export default CalculatorWidget;

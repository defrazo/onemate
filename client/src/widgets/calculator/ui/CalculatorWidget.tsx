import { WIDGET_TIPS } from '@/shared/content';
import { Input, Tooltip } from '@/shared/ui';

import { useCalculator } from '../model';
import { CalculatorButtons, CalculatorLog } from '.';

const CalculatorWidget = () => {
	const { display, handleButtonClick, result } = useCalculator();

	return (
		<>
			<div className="flex items-center">
				<Tooltip content={WIDGET_TIPS.calculator}>
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

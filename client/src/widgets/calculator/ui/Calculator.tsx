import { Input } from '@/shared/ui';

import { useCalculator } from '../model';
import { Buttons, Log, Status } from './components';

export const Calculator = () => {
	const { display, result, clearHistory, handleButtonClick } = useCalculator();

	return (
		<>
			<Input
				className="pointer-events-none px-2 py-0.5 text-right text-xl font-bold tabular-nums lg:py-2 lg:text-2xl"
				name="calc-output"
				readOnly
				size="custom"
				tabIndex={-1}
				type="text"
				value={display}
				variant="ghost"
			/>
			<div className="flex min-h-0 flex-1 flex-col xl:flex-row">
				<Buttons onClick={handleButtonClick} />
				<Log result={result} />
			</div>
			<Status count={result.length} onClear={clearHistory} />
		</>
	);
};

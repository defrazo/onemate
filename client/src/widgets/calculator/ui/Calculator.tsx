import { Input } from '@/shared/ui';

import { useCalculator } from '../model';
import { Buttons, Log, Status } from './components';

export const Calculator = () => {
	const { display, result, clearHistory, handleButtonClick } = useCalculator();

	return (
		<>
			<Input
				className="pointer-events-none pl-2 text-right text-2xl font-bold tabular-nums"
				name="calc-output"
				readOnly
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

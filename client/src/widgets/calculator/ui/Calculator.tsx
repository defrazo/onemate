import { Input } from '@/shared/ui';

import { useCalculator } from '../model';
import { Buttons, Log, Status } from './components';

export const Calculator = () => {
	const { display, result, clearHistory, handleButtonClick } = useCalculator();

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<Input
				readOnly
				className="pointer-events-none text-right text-xl font-bold tabular-nums lg:text-2xl"
				name="calc-output"
				padding="sm"
				tabIndex={-1}
				type="text"
				value={display}
				variant="tone"
			/>
			<div className="mt-2 flex min-h-0 flex-1 flex-col md:mt-3 xl:flex-row md:landscape:flex-row">
				<Buttons onClick={handleButtonClick} />
				<Log result={result} onClear={clearHistory} />
			</div>
			<Status count={result.length} />
		</div>
	);
};

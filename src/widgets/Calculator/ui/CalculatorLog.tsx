import { Textarea } from '@/shared/ui';

import { renderResult } from '../lib';
import { ResultItem } from '../model';

interface CalculatorLogProps {
	result: ResultItem[];
}

export const CalculatorLog = ({ result }: CalculatorLogProps) => {
	return (
		<Textarea
			className="pointer-events-none grow text-right"
			placeholder="Журнала еще нет"
			readOnly
			value={renderResult(result)}
			variant="ghost"
		/>
	);
};

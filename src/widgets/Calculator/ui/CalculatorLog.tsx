import { Textarea } from '@/shared/ui';

import { renderResult } from '../lib';
import type { ResultItem } from '../model';

interface CalculatorLogProps {
	result: ResultItem[];
}

export const CalculatorLog = ({ result }: CalculatorLogProps) => {
	return (
		<Textarea
			className="h-full border-1 border-[var(--border-color)] text-right"
			placeholder="Журнала еще нет"
			readOnly
			value={renderResult(result)}
			variant="custom"
		/>
	);
};

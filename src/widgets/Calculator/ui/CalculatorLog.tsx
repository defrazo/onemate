import { useState } from 'react';

import { IconBack, IconForward } from '@/shared/assets/icons';
import { useDeviceType, useOrientation } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button, Textarea } from '@/shared/ui';

import { renderResult } from '../lib';
import type { ResultItem } from '../model';

interface CalculatorLogProps {
	result: ResultItem[];
}

export const CalculatorLog = ({ result }: CalculatorLogProps) => {
	const device = useDeviceType();
	const ortientation = useOrientation();
	const [isVisible, setIsVisible] = useState<boolean>(false);

	return (
		<>
			{device === 'mobile' || device === 'tablet' || ortientation === 'portrait' ? (
				<Textarea
					className="hide-scrollbar core-border h-full max-h-[12dvh] min-h-22 text-right"
					placeholder="Журнала еще нет"
					readOnly
					value={renderResult(result)}
					variant="custom"
				/>
			) : (
				<div
					className={cn('h-full transition-[flex] duration-300 ease-in-out', isVisible ? 'flex-1' : 'flex-0')}
				>
					<div className="relative flex h-full items-center">
						<Textarea
							className={cn(
								'hide-scrollbar h-full rounded-none border-l border-[var(--border-color)] py-2 pr-4 text-right',
								!isVisible && 'cursor-default border-none'
							)}
							placeholder={isVisible ? 'Журнала еще нет' : ''}
							readOnly
							size="custom"
							value={isVisible ? renderResult(result) : ''}
							variant="custom"
						/>
						<Button
							centerIcon={
								isVisible ? <IconForward className="size-4" /> : <IconBack className="size-4" />
							}
							className="absolute right-0 h-full cursor-pointer text-[var(--accent-default)] select-none hover:text-[var(--accent-hover)]"
							size="custom"
							title={isVisible ? 'Свернуть журнал' : 'Развернуть журнал'}
							variant="mobile"
							onClick={() => setIsVisible((prev) => !prev)}
						/>
					</div>
				</div>
			)}
		</>
	);
};

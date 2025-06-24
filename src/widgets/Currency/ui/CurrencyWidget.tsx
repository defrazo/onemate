import { forwardRef } from 'react';

import { cn } from '@/shared/lib/utils';

import { CurrencyControls, CurrencyView } from '.';

interface CurrencyWidgetProps {
	className?: string;
}

const CurrencyWidget = forwardRef<HTMLDivElement, CurrencyWidgetProps>((props, ref) => {
	return (
		<div
			ref={ref}
			{...props}
			className={cn(
				'core-card core-base flex w-full flex-1 flex-col gap-2 shadow-[var(--shadow)]',
				props.className
			)}
		>
			<span className="core-header">Конвертер валют</span>
			<CurrencyView />
			<CurrencyControls />
		</div>
	);
});

export default CurrencyWidget;

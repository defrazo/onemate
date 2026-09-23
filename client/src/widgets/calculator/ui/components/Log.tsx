import { useDeviceType, useOrientation } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { EmptyHistory } from '@/shared/ui';

import type { ResultItem } from '../../model';

export const Log = ({ result }: { result: ResultItem[] }) => {
	const device = useDeviceType();
	const orientation = useOrientation();

	const isMobile = device === 'mobile' || device === 'tablet' || orientation === 'portrait';

	return (
		<div className={cn('min-h-0 min-w-0 overflow-hidden', isMobile ? 'basis-28' : 'basis-1/2')}>
			<div
				className={cn(
					'flex h-full min-h-0 flex-col border-(--border-color)',
					isMobile ? 'mt-2 border-t pt-2' : 'ml-2 border-l pl-3'
				)}
			>
				{result.length === 0 ? (
					<EmptyHistory description="Вычисления появятся здесь" />
				) : (
					<div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto">
						<div className="flex flex-col gap-1">
							{result
								.slice()
								.reverse()
								.map(({ expression, result }, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between gap-3 text-sm tabular-nums"
									>
										<span className="truncate text-(--color-secondary)">{expression}</span>
										<span className="shrink-0">{result}</span>
									</div>
								))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

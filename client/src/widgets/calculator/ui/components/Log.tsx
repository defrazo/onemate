import { useDeviceType, useOrientation } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { EmptyHistory } from '@/shared/ui';

import type { ResultItem } from '../../model';

export const Log = ({ result, isVisible }: { result: ResultItem[]; isVisible: boolean }) => {
	const device = useDeviceType();
	const orientation = useOrientation();

	const isMobile = device === 'mobile' || device === 'tablet' || orientation === 'portrait';

	return (
		<div
			className={cn(
				'overflow-hidden',
				isMobile ? (isVisible ? 'basis-32' : 'basis-0') : isVisible ? 'basis-1/2' : 'basis-0'
			)}
		>
			<div
				className={cn(
					'h-full min-h-0 border-(--border-color)',
					isMobile ? 'mt-2 border-t pt-2' : 'ml-2 border-l pl-3'
				)}
			>
				<div
					className={cn(
						'h-full',
						'transition-[opacity,transform] duration-300 ease-out',
						isVisible ? 'opacity-100' : 'pointer-events-none translate-x-2 opacity-0'
					)}
				>
					{result.length === 0 ? (
						<EmptyHistory description="Вычисления появятся здесь" />
					) : (
						<div className="hide-scrollbar flex h-full min-h-0 flex-col gap-1 overflow-y-auto">
							{result
								.slice()
								.reverse()
								.map(({ expression, result }, index) => (
									<div
										key={index}
										className="flex items-center justify-between gap-3 text-sm tabular-nums"
									>
										<span className="truncate text-(--color-secondary)">{expression}</span>
										<span className="shrink-0">{result}</span>
									</div>
								))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

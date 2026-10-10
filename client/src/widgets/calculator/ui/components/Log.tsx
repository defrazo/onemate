import { useResponsive } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button, NoContent } from '@/shared/ui';

import type { ResultItem } from '../../model';

export const Log = ({ result, onClear }: { result: ResultItem[]; onClear: () => void }) => {
	const { isMobile } = useResponsive();

	return (
		<div className={cn('min-h-0 min-w-0 overflow-hidden not-xl:flex-1', !isMobile && 'basis-1/2')}>
			<div
				className={cn(
					'flex h-full min-h-0 flex-col border-(--border-primary)',
					isMobile ? 'mt-2' : 'ml-4 border-l pl-4'
				)}
			>
				{result.length === 0 ? (
					<NoContent className="-mt-2" description="Вычисления появятся здесь" title="История пуста" />
				) : (
					<div className="flex min-h-0 flex-1 flex-col gap-1">
						<Button
							className="w-fit text-xs text-(--text-secondary) opacity-70 hover:text-(--status-error)"
							padding="none"
							title="Очистить историю"
							variant="custom"
							onClick={onClear}
						>
							Очистить
						</Button>
						<div className="flex flex-col gap-1 overflow-y-auto not-xl:pr-2 xl:scrollbar-none">
							{result
								.slice()
								.reverse()
								.map(({ expression, result }, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between gap-3 text-xs tabular-nums lg:text-sm"
									>
										<span className="truncate text-(--text-secondary)">{expression}</span>
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

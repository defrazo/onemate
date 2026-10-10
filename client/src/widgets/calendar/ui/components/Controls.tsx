import { IconCancel, IconCheck, IconCopy, IconTrash } from '@tabler/icons-react';

import { useCopy, useResponsive } from '@/shared/lib/hooks';
import { cn, pluralize } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import type { DateRange, RangeInfo } from '../../model';

interface ControlsProps {
	range: DateRange;
	rangeInfo: RangeInfo | null;
	includeWeekends: boolean;
	onToggleWeekends: () => void;
	onReset: () => void;
}

export const Controls = ({ range, rangeInfo, includeWeekends, onToggleWeekends, onReset }: ControlsProps) => {
	const { isMobile, isTablet } = useResponsive();
	const copy = useCopy();

	const hasStart = range[0];

	return (
		<div className="flex flex-col">
			<div className="mb-2 flex h-8 items-center lg:my-2">
				{rangeInfo ? (
					<div className="mx-auto flex items-center gap-1 text-sm">
						<span className="trim text-(--text-secondary)">{rangeInfo.label} </span>
						<span className="trim text-(--text-disabled)">·</span>
						<span className="trim font-semibold">
							{rangeInfo.days} {pluralize(rangeInfo.days, 'день', 'дня', 'дней')}
						</span>
						{rangeInfo.weekendLabel && (
							<span className="trim text-(--text-secondary)">({rangeInfo.weekendLabel})</span>
						)}
						<Button
							centerIcon={<IconCopy className="size-4" />}
							className="ml-1 hidden text-sm md:block"
							disabled={rangeInfo === null}
							padding="none"
							title="Скопировать период"
							variant="icon"
							onClick={() => copy(rangeInfo.copyText, 'Период скопирован')}
						/>
					</div>
				) : (
					<span className="flex-1 text-center text-sm text-(--text-secondary)">
						Выберите дату {hasStart ? 'конца' : 'начала'} периода
					</span>
				)}
			</div>
			<div className="flex w-full items-center justify-between gap-2">
				<Button
					className={cn(
						'h-8 w-full border border-(--border-primary) bg-transparent text-xs text-(--text-primary) hover:bg-(--accent-primary)/20 hover:text-(--accent-primary) enabled:border-(--accent-primary)/70 xl:text-sm',
						includeWeekends &&
							'border-transparent bg-(--accent-primary-muted) text-(--accent-primary) hover:bg-(--accent-primary)/20'
					)}
					disabled={!rangeInfo?.hasWeekends}
					rightIcon={includeWeekends && <IconCheck className="size-4" />}
					onClick={onToggleWeekends}
				>
					Учитывать выходные
				</Button>
				<Button
					centerIcon={<IconCopy className="size-4" />}
					className="block text-xs md:hidden"
					disabled={rangeInfo === null}
					title="Скопировать период"
					variant="icon"
					onClick={() => {
						if (!rangeInfo) return;
						copy(rangeInfo.copyText, 'Период скопирован');
					}}
				/>
				<Button
					centerIcon={
						isMobile &&
						!isTablet &&
						(hasStart ? <IconTrash className="size-4.5" /> : <IconCancel className="size-4.5" />)
					}
					className={cn(
						'h-8 bg-transparent text-xs lg:min-w-30 lg:px-3 xl:text-sm xl:hover:border-transparent',
						!isMobile && 'w-32'
					)}
					leftIcon={!isMobile || (isTablet && hasStart && <IconTrash className="size-4.5" />)}
					title={hasStart ? 'Сбросить' : 'Отмена'}
					variant={isMobile && !isTablet ? 'icon' : 'danger'}
					onClick={onReset}
				>
					{(!isMobile || isTablet) && hasStart ? 'Сбросить' : 'Отмена'}
				</Button>
			</div>
		</div>
	);
};

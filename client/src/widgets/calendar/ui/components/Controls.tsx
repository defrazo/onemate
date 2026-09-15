import { IconCopy, IconTrash } from '@tabler/icons-react';

import { IconChecked, IconUnchecked } from '@/shared/assets/icons';
import { useCopy, useDeviceType, useOrientation } from '@/shared/lib/hooks';
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
	const device = useDeviceType();
	const orientation = useOrientation();
	const copy = useCopy();

	const isMobile = device === 'mobile' || device === 'tablet' || orientation === 'portrait';
	const hasStart = range[0];

	return (
		<div className="flex flex-col border-t border-(--border-color)">
			<div className="my-2 flex h-8 items-center">
				{rangeInfo ? (
					<>
						<div className="flex w-full justify-center gap-1 text-sm lg:-mr-10">
							<span className="trim text-(--color-secondary)">{rangeInfo.label} </span>
							<span className="trim text-(--color-disabled)">·</span>
							<span className="trim font-bold">
								{rangeInfo.days} {pluralize(rangeInfo.days, 'день', 'дня', 'дней')}
							</span>
							{rangeInfo.weekendLabel && (
								<span className="trim text-(--color-secondary)">({rangeInfo.weekendLabel})</span>
							)}
						</div>
						<Button
							centerIcon={<IconCopy className="size-4" />}
							className="hidden px-3 text-sm hover:text-(--accent-default) lg:block"
							disabled={rangeInfo === null}
							size="custom"
							title="Скопировать период"
							variant="mobile"
							onClick={() => copy(rangeInfo.copyText, 'Период скопирован!')}
						/>
					</>
				) : (
					<span className="flex-1 text-center text-sm text-(--color-secondary)">
						Выберите дату {hasStart ? 'конца' : 'начала'} периода
					</span>
				)}
			</div>
			<div className="flex w-full items-center justify-between gap-2">
				<Button
					className={cn(
						'core-border h-8 w-full bg-transparent text-xs text-(--color-secondary) enabled:border-transparent enabled:bg-(--accent-default)/10 enabled:text-(--accent-default) xl:text-sm',
						includeWeekends &&
							'border-transparent bg-(--accent-default)/10 text-(--accent-default) hover:bg-(--accent-default)/20'
					)}
					disabled={!rangeInfo?.hasWeekends}
					leftIcon={
						includeWeekends ? <IconChecked className="size-3.5" /> : <IconUnchecked className="size-3.5" />
					}
					variant="mobile"
					onClick={onToggleWeekends}
				>
					Учитывать выходные
				</Button>
				<Button
					centerIcon={<IconCopy className="size-4" />}
					className="block px-3 text-xs lg:hidden"
					disabled={rangeInfo === null}
					size="custom"
					title="Скопировать период"
					variant="mobile"
					onClick={() => {
						if (!rangeInfo) return;
						copy(rangeInfo.copyText, 'Период скопирован!');
					}}
				/>
				<Button
					centerIcon={isMobile && <IconTrash className="size-4.5" />}
					className={cn(
						'h-8 px-3 text-xs hover:border-transparent hover:enabled:bg-(--warning-default)/80 xl:text-sm',
						!isMobile && 'core-border w-32'
					)}
					disabled={!hasStart}
					leftIcon={!isMobile && <IconTrash className="size-4.5" />}
					size="custom"
					title="Сбросить"
					variant="mobile"
					onClick={onReset}
				>
					{!isMobile && 'Сбросить'}
				</Button>
			</div>
		</div>
	);
};

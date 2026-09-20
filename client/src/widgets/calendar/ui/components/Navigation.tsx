import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

import { formatMonthTitle } from '../../lib';

interface NavigationProps {
	month: Date;
	onNext: () => void;
	onPrev: () => void;
}

export const Navigation = ({ month, onNext, onPrev }: NavigationProps) => {
	return (
		<div className="flex h-8 items-center justify-center">
			<Button
				centerIcon={
					<IconChevronLeft className="size-4 text-(--color-secondary) opacity-0 transition-opacity group-hover:opacity-100 hover:text-(--accent-default)" />
				}
				className="group size-6 rounded-lg hover:bg-(--accent-default)/10"
				size="custom"
				title="Предыдущий месяц"
				variant="custom"
				onClick={onPrev}
			/>
			<div className="trim min-w-38 cursor-default text-center font-bold">{formatMonthTitle(month)}</div>
			<Button
				centerIcon={
					<IconChevronRight className="size-4 text-(--color-secondary) opacity-0 transition-opacity group-hover:opacity-100 hover:text-(--accent-default)" />
				}
				className="group size-6 rounded-lg hover:bg-(--accent-default)/10"
				size="custom"
				title="Следующий месяц"
				variant="custom"
				onClick={onNext}
			/>
		</div>
	);
};

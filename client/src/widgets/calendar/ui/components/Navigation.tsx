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
					<IconChevronLeft className="size-4 transition-opacity group-hover:opacity-100 xl:opacity-0" />
				}
				className="group size-6 rounded-md"
				padding="none"
				title="Предыдущий месяц"
				variant="iconSurface"
				onClick={onPrev}
			/>
			<div className="trim min-w-38 cursor-default text-center font-semibold">{formatMonthTitle(month)}</div>
			<Button
				centerIcon={
					<IconChevronRight className="size-4 transition-opacity group-hover:opacity-100 xl:opacity-0" />
				}
				className="group size-6 rounded-md"
				padding="none"
				title="Следующий месяц"
				variant="iconSurface"
				onClick={onNext}
			/>
		</div>
	);
};

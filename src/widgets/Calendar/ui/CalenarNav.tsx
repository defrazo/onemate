import { IconBack, IconForward } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

import { formatMonthTitle } from '../lib';

interface CalendarNavProps {
	currentDate: Date;
	handleNext: () => void;
	handlePrev: () => void;
}

export const CalendarNav = ({ currentDate, handleNext, handlePrev }: CalendarNavProps) => {
	return (
		<div className="flex items-center justify-center">
			<Button centerIcon={<IconBack className="size-4" />} size="custom" variant="custom" onClick={handlePrev} />
			<div className="mx-4 cursor-default text-base font-semibold capitalize md:text-lg">
				{formatMonthTitle(currentDate)}
			</div>
			<Button
				centerIcon={<IconForward className="size-4" />}
				size="custom"
				variant="custom"
				onClick={handleNext}
			/>
		</div>
	);
};

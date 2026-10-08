import { arrowIcon, calendarIcon, insertSvg } from '../../../lib';

export const createTaskViewProperties = ({ startDate, endDate }: { startDate: string; endDate: string | null }) => {
	const element = document.createElement('div');
	element.className = 'flex flex-col overflow-hidden rounded-lg bg-(--tone)';

	// === PERIOD ROW ===
	const periodRow = document.createElement('div');
	periodRow.className = 'flex min-h-11 items-center gap-2 px-3 py-2';

	const icon = document.createElement('span');
	icon.className = 'flex size-5 shrink-0 items-center justify-center text-(--text-disabled)';
	insertSvg(icon, calendarIcon, 'size-5');

	const label = document.createElement('span');
	label.textContent = 'Период';
	label.className = 'trim mt-px min-w-0 flex-1 text-(--text-secondary) opacity-70 select-none';

	const value = document.createElement('div');
	value.className = 'ml-auto flex shrink-0 items-center gap-2 text-sm text-(--text-secondary)';

	const start = document.createElement('span');
	start.textContent = formatDate(startDate);
	start.className = 'trim text-(--text-primary)';

	const arrow = document.createElement('div');
	arrow.className = 'flex size-5 shrink-0 items-center justify-center text-(--text-disabled)';
	insertSvg(arrow, arrowIcon, 'size-5');

	const end = document.createElement('span');
	end.textContent = endDate ? formatDate(endDate) : 'Без срока';
	end.className = 'trim text-(--text-primary)';

	value.append(start, arrow, end);

	periodRow.append(icon, label, value);

	element.append(periodRow);

	return { element };
};

const formatDate = (iso: string): string => {
	const [year, month, day] = iso.split('-');
	return `${day}.${month}.${year}`;
};

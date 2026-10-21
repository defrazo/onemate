import type { Icon } from '@tabler/icons-react';

import { BackButton } from '@/shared/ui';

interface ViewHeaderProps {
	icon: Icon;
	title: string;
	onBack: () => void;
}

export const ViewHeader = ({ icon: Icon, title, onBack }: ViewHeaderProps) => {
	return (
		<div className="flex justify-between">
			<BackButton title="Вернуться к заметкам" onClick={onBack} />
			<div className="flex items-center gap-1.5 rounded-md bg-(--accent-primary-muted) px-2 py-1 text-(--accent-primary)">
				<Icon className="size-4" />
				<span className="trim text-sm text-(--accent-primary)">{title}</span>
			</div>
		</div>
	);
};

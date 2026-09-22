import { Icon, IconArrowLeft } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

interface ViewHeaderProps {
	icon: Icon;
	title: string;
	onBack: () => void;
}

export const ViewHeader = ({ icon: Icon, title, onBack }: ViewHeaderProps) => {
	return (
		<div className="flex justify-between">
			<Button
				className="rounded-lg bg-white/5 px-2 py-1 text-xs text-(--color-secondary) hover:bg-white/8"
				leftIcon={<IconArrowLeft className="size-4" />}
				size="sm"
				title="Назад"
				variant="mobile"
				onClick={onBack}
			>
				Назад
			</Button>
			<div className="flex items-center gap-1.5 rounded-lg bg-(--accent-default)/10 px-2 py-1 text-(--accent-default)">
				<Icon className="size-4" />
				<span className="trim text-sm font-medium text-(--accent-default)">{title}</span>
			</div>
		</div>
	);
};

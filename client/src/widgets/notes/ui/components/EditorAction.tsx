import { Icon } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

interface EditorActionProps {
	icon: Icon;
	title: string;
	onClick: () => void;
}

export const EditorAction = ({ icon: Icon, title, onClick }: EditorActionProps) => (
	<Button
		centerIcon={
			<Icon className="size-4 text-(--color-secondary) transition-colors hover:text-(--accent-default)" />
		}
		className="size-6 rounded-lg hover:bg-(--accent-default)/10 active:scale-90 active:bg-(--accent-default)/20"
		size="custom"
		title={title}
		variant="mobile"
		onClick={onClick}
	/>
);

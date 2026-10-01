import type { Icon } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

interface EditorActionProps {
	icon: Icon;
	title: string;
	onClick: () => void;
}

export const EditorAction = ({ icon: Icon, title, onClick }: EditorActionProps) => (
	<Button
		centerIcon={<Icon className="size-4 text-(--text-secondary) transition-colors hover:text-(--accent-primary)" />}
		className="size-6 rounded-lg hover:bg-(--accent-primary)/10 active:scale-90 active:bg-(--accent-primary)/20"
		size="custom"
		title={title}
		variant="mobile"
		onClick={onClick}
	/>
);

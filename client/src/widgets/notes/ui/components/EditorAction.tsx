import type { Icon } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

interface EditorActionProps {
	icon: Icon;
	title: string;
	onClick: () => void;
}

export const EditorAction = ({ icon: Icon, title, onClick }: EditorActionProps) => (
	<Button
		centerIcon={<Icon className="size-4.5" />}
		className="size-6.5"
		padding="none"
		title={title}
		variant="iconSurface"
		onClick={onClick}
	/>
);

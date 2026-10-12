import type { Icon } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

interface EditorActionProps {
	icon: Icon;
	title: string;
	disabled?: boolean;
	loading?: boolean;
	onClick: () => void;
}

export const EditorAction = ({ icon: Icon, title, disabled, loading, onClick }: EditorActionProps) => (
	<Button
		centerIcon={<Icon className="size-4.5" />}
		className="size-8 lg:size-6.5"
		disabled={disabled}
		loading={loading}
		padding="none"
		title={title}
		variant="iconSurface"
		onClick={onClick}
	/>
);

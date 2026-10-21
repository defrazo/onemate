import { IconTrash } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

export const RemoveButton = ({ onClick }: { onClick: () => void }) => (
	<Button
		centerIcon={
			<IconTrash className="mr-1 ml-1.5 size-5 opacity-50 transition-[color,opacity] hover:opacity-100" />
		}
		className="hover:text-(--status-error)"
		padding="none"
		title="Удалить"
		variant="icon"
		onClick={onClick}
	/>
);

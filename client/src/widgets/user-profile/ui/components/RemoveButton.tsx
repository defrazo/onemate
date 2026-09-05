import { IconTrashFilled } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

export const RemoveButton = ({ onClick }: { onClick: () => void }) => (
	<Button
		centerIcon={
			<IconTrashFilled className="mr-1 ml-1.5 size-5.5 opacity-50 transition-opacity hover:opacity-100" />
		}
		className="hover:text-(--status-error)"
		size="custom"
		title="Удалить"
		variant="custom"
		onClick={onClick}
	/>
);

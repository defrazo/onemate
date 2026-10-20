import { IconCopy } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

export const CopyButton = ({ onClick }: { onClick: () => void }) => {
	return (
		<Button
			centerIcon={<IconCopy className="size-4" />}
			className="p-1.5"
			padding="none"
			title="Скопировать"
			type="button"
			variant="iconSurface"
			onClick={onClick}
		/>
	);
};

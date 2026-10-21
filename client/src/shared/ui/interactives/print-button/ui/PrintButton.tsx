import { IconPrinter } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

export const PrintButton = ({ className }: { className?: string }) => {
	return (
		<Button
			centerIcon={<IconPrinter className="size-6" />}
			className={cn('print:hidden', className)}
			padding="none"
			title="Распечатать"
			variant="icon"
			onClick={() => window.print()}
		>
			Печать
		</Button>
	);
};

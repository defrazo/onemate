import { IconPrinter } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

export const PrintButton = ({ className }: { className?: string }) => {
	return (
		<Button
			centerIcon={<IconPrinter className="size-6" />}
			className={cn('text-(--text-disabled) hover:text-(--accent-primary-hover) print:hidden', className)}
			size="custom"
			title="Распечатать"
			variant="mobile"
			onClick={() => window.print()}
		>
			Печать
		</Button>
	);
};

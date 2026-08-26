import { Printer } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface PrintButtonProps {
	className?: string;
}

const PrintButton = ({ className }: PrintButtonProps) => {
	return (
		<Button
			centerIcon={<Printer className="size-6" />}
			className={cn('text-(--color-disabled) hover:text-(--accent-hover) print:hidden', className)}
			size="custom"
			title="Распечатать"
			variant="mobile"
			onClick={() => window.print()}
		>
			Печать
		</Button>
	);
};

export default PrintButton;

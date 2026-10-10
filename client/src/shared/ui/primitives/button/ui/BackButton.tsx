import { IconArrowLeft } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface BackButtonProps {
	onBack?: string;
	title?: string;
	onClick: () => void;
	className?: string;
}

export const BackButton = ({ title, onBack = 'Назад', onClick, className }: BackButtonProps) => (
	<Button
		className={cn(
			'h-7 rounded-md text-(--text-secondary) hover:text-(--text-primary) active:scale-90 md:text-sm lg:h-6',
			className
		)}
		leftIcon={<IconArrowLeft className="size-4" />}
		padding="sm"
		title={title || onBack}
		variant="tone"
		onClick={onClick}
	>
		<span className="trim">{onBack}</span>
	</Button>
);

import type { Icon } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';

interface InputLabelProps {
	icon: Icon;
	htmlFor?: string;
	className?: string;
}

export const InputLabel = ({ icon: Icon, htmlFor, className }: InputLabelProps) => (
	<label
		className={cn('flex cursor-text items-center border-r border-(--border-primary)', className)}
		htmlFor={htmlFor}
	>
		<Icon className="mr-1.5 ml-1 size-5.5 text-(--text-primary)/80" />
	</label>
);

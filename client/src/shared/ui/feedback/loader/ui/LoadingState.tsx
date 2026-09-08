import { cn } from '@/shared/lib/utils';

import { Spinner } from '.';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

const sizes = {
	sm: 'size-5 border-2',
	md: 'size-7 border-3',
	lg: 'size-20 border-4',
	xl: 'size-25 border-4',
};

export const LoadingState = ({ size = 'md', className }: { size?: SpinnerSize; className?: string }) => (
	<div className={cn('flex h-full flex-1 items-center justify-center', className)}>
		<Spinner className={sizes[size]} />
	</div>
);

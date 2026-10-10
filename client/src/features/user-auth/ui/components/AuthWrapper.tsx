import type { PropsWithChildren } from 'react';

import { cn } from '@/shared/lib/utils';

interface AuthWrapperProps {
	isPage?: boolean;
}

export const AuthWrapper = ({ children, isPage = false }: PropsWithChildren<AuthWrapperProps>) => {
	return (
		<div
			className={cn(
				'my-auto flex flex-col items-center justify-center gap-3 rounded-xl text-(--accent-primary-text) sm:m-auto sm:w-md md:px-2',
				isPage && 'rounded-xl border-(--border-primary) py-7 xl:border xl:bg-(--border-primary)'
			)}
		>
			{children}
		</div>
	);
};

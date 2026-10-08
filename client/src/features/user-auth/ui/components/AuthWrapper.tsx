import type { PropsWithChildren } from 'react';

import { cn } from '@/shared/lib/utils';

interface AuthWrapperProps {
	isPage?: boolean;
}

export const AuthWrapper = ({ children, isPage = false }: PropsWithChildren<AuthWrapperProps>) => {
	return (
		<div className="core-gap relative m-auto flex h-full min-h-0 flex-1 cursor-default scrollbar-none flex-col overflow-x-hidden overflow-y-auto">
			<div
				className={cn(
					'core-gap my-auto flex flex-col items-center justify-center rounded-xl px-7 pb-3 text-(--accent-primary-text) sm:m-auto sm:w-lg',
					isPage && 'rounded-xl border-(--border-primary) py-7 xl:border xl:bg-(--border-primary)'
				)}
			>
				{children}
			</div>
		</div>
	);
};

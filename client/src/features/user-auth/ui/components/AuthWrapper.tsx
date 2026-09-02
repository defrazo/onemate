import type { PropsWithChildren } from 'react';

import { cn } from '@/shared/lib/utils';

interface AuthWrapperProps {
	isPage?: boolean;
}

export const AuthWrapper = ({ children, isPage = false }: PropsWithChildren<AuthWrapperProps>) => {
	return (
		<div className="hide-scrollbar relative m-auto flex h-full min-h-0 flex-1 cursor-default flex-col gap-4 overflow-x-hidden overflow-y-auto">
			<div
				className={cn(
					'core-gap my-auto flex flex-col items-center justify-center rounded-xl px-7 pb-3 text-(--accent-primary-text) sm:m-auto sm:w-lg',
					isPage && 'rounded-xl border-[#fafafa12] py-7 xl:border xl:bg-[#fafafa0d]/50'
				)}
			>
				{children}
			</div>
		</div>
	);
};

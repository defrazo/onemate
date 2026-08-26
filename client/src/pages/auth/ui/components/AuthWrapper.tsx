import type { PropsWithChildren } from 'react';

import { useDeviceType } from '@/shared/lib/hooks/useDeviceType';

export const AuthWrapper = ({ children }: PropsWithChildren) => {
	const device = useDeviceType();

	return (
		<div className="hide-scrollbar relative flex h-full min-h-0 w-full flex-1 cursor-default flex-col gap-4 overflow-x-hidden overflow-y-auto rounded-xl border border-[#fafafa12] p-3 shadow-(--shadow) md:p-6 lg:rounded-l-none">
			<div className="core-gap my-auto flex flex-col items-center justify-center rounded-xl border-[#fafafa12] p-0 text-(--accent-primary-text) sm:m-auto sm:w-lg sm:p-12 xl:border xl:bg-[#fafafa0d]/50">
				{children}
			</div>
			{device === 'mobile' ? (
				<div className="pointer-events-none absolute top-0 right-0 size-100 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7a5cff]/30 blur-[120px]" />
			) : (
				<div className="pointer-events-none absolute top-1/2 right-0 size-100 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7a5cff]/30 blur-[120px]" />
			)}
		</div>
	);
};

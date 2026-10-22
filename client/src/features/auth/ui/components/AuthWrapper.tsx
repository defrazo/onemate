import type { PropsWithChildren } from 'react';

export const AuthWrapper = ({ children }: PropsWithChildren) => {
	return (
		<div className="my-auto flex flex-col items-center justify-center gap-3 rounded-xl text-(--accent-primary-text) sm:m-auto sm:w-md md:px-2">
			{children}
		</div>
	);
};

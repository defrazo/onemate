export const AuthDivider = () => {
	return (
		<div className="flex w-full items-center select-none">
			<div className="mt-px h-px w-full animate-pulse bg-linear-to-l from-(--accent-primary)/50" />
			<span className="trim px-2 text-xs text-(--accent-primary-text) lg:text-sm xl:px-4">или</span>
			<div className="mt-px h-px w-full animate-pulse bg-linear-to-r from-(--accent-primary)/50" />
		</div>
	);
};

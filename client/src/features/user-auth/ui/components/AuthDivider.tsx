export const AuthDivider = () => {
	return (
		<div className="flex w-full items-center select-none">
			<div className="h-0.5 w-full animate-pulse bg-linear-to-l from-(--color-accent)/50" />
			<span className="px-2 text-(--accent-primary-text) xl:px-4">ИЛИ</span>
			<div className="h-0.5 w-full animate-pulse bg-linear-to-r from-(--color-accent)/50" />
		</div>
	);
};

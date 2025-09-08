export const PreloaderExt = () => {
	return (
		<div className="flex h-full flex-1 flex-col items-center justify-center gap-2">
			<div className="loader" />
			<span className="animate-pulse text-xl font-medium">Загрузка OneMate</span>
		</div>
	);
};

const MobileBlocker = () => {
	return (
		<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-(--bg-primary) text-center text-(--color-primary)">
			<p className="mb-2 text-2xl font-semibold">⚠️ Страница недоступна</p>
			<p className="max-w-md text-lg">
				Пожалуйста, откройте эту страницу на компьютере или планшете в горизонтальном режиме.
			</p>
		</div>
	);
};

export default MobileBlocker;

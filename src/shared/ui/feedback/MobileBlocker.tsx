const MobileBlocker = () => {
	return (
		<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)] px-4 text-center text-[var(--color-primary)]">
			<p className="mb-2 text-xl font-semibold">⚠️ Страница недоступна</p>
			<p>Открой эту страницу на компьютере или переверни устройство горизонтально.</p>
		</div>
	);
};

export default MobileBlocker;

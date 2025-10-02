import { useEffect, useState } from 'react';

import { IconClose } from '@/shared/assets/icons';
import { LS_CACHE_UI, storage } from '@/shared/lib/storage';
import { Button } from '@/shared/ui';
import { useDeviceType } from '@/shared/lib/hooks';

const DemoBanner = () => {
	const device = useDeviceType();
	const [isVisible, setIsVisible] = useState<boolean>(true);

	useEffect(() => {
		const cache = storage.get(LS_CACHE_UI) ?? {};
		setIsVisible(cache.demo === false);
	}, []);

	const onClose = () => {
		setIsVisible(false);
		const cache = storage.get(LS_CACHE_UI) ?? {};
		storage.set(LS_CACHE_UI, { ...cache, demo: true });
	};

	if (!isVisible) return null;

	return (
		<div className="sticky top-0 z-100 bg-[var(--accent-default)] shadow">
			<div className="relative flex items-center justify-center gap-2 py-3 text-[var(--color-primary)] select-none md:py-2">
				<div className="mx-auto flex flex-col justify-center gap-0 text-xs leading-4 text-[var(--accent-text)] md:text-base">
					{device !== 'mobile' ? (
						<>
							Вы используете демонстрационную версию без обработки персональных данных.
							<div className="flex justify-center gap-2 text-xs opacity-60 lg:text-sm">
								Ваши данные не сохраняются и часть функций может быть недоступна.
								<a className="underline hover:text-[var(--accent-text)]" href="/demo-info">
									Подробнее
								</a>
							</div>
						</>
					) : (
						<div className="flex gap-1">
							Вы используете демоверсию.
							<a className="underline hover:text-[var(--accent-text)]" href="/demo-info">
								Подробнее
							</a>
						</div>
					)}
				</div>
				<Button
					aria-label="Закрыть демо-баннер"
					centerIcon={<IconClose className="size-4 md:size-6" />}
					className="absolute right-4 text-[var(--accent-text)] hover:text-[var(--color-primary)]"
					size="custom"
					variant="mobile"
					onClick={onClose}
				/>
			</div>
		</div>
	);
};

export default DemoBanner;

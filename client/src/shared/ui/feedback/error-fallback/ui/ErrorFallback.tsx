import { useEffect, useState } from 'react';

import { IconNoData } from '@/shared/assets/icons';
import { Button, Preloader } from '@/shared/ui';

interface ErrorFallbackProps {
	icon?: boolean;
	message?: string;
	delay?: number;
	onRetry?: () => void;
}

const DELAY = 5000; // 10 секунд

const ErrorFallback = ({
	icon = true,
	message = 'Не удалось загрузить данные',
	delay = DELAY,
	onRetry,
}: ErrorFallbackProps) => {
	const [showError, setShowError] = useState<boolean>(false);

	useEffect(() => {
		const timer = setTimeout(() => setShowError(true), delay);
		return () => clearTimeout(timer);
	}, [delay]);

	if (!showError) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<Preloader className="size-25" />
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col items-center justify-center">
			{icon && <IconNoData className="size-55 text-[#100f0f]" />}
			<div className="flex flex-col items-center">
				<span className="text-base select-none md:text-lg xl:text-xl">{message}</span>
				{onRetry && (
					<Button className="mt-2 w-40 text-base" variant="default" onClick={onRetry}>
						Повторить
					</Button>
				)}
			</div>
		</div>
	);
};

export default ErrorFallback;

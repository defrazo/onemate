import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Navbar } from '@/features/navigation';
import { cn } from '@/shared/lib/utils';

export const MobileTabBar = observer(() => {
	const location = useLocation();

	const { userStore } = useStore();

	const hideOnScrollPaths = ['/', '/terms-of-service', '/privacy-policy', '/about'];

	const [hidden, setHidden] = useState<boolean>(false);
	const lastScroll = useRef(0);
	const scrollTimeout = useRef<number | null>(null);

	const canHide = hideOnScrollPaths.includes(location.pathname);
	const isHidden = canHide && hidden;

	useEffect(() => {
		if (!canHide) return;

		const handleScroll = () => {
			const currentScroll = window.scrollY;
			const documentHeight = document.documentElement.scrollHeight;
			const windowHeight = window.innerHeight;

			const isAtBottom = currentScroll + windowHeight >= documentHeight - 10;

			if (isAtBottom) {
				setHidden(false);
				lastScroll.current = currentScroll;
				return;
			}

			if (currentScroll > lastScroll.current + 5) setHidden(true);
			else if (currentScroll < lastScroll.current - 5) setHidden(false);

			if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
			scrollTimeout.current = window.setTimeout(() => (lastScroll.current = currentScroll), 50);
		};

		lastScroll.current = window.scrollY;
		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
		};
	}, [canHide]);

	if (!userStore.id) return null;

	return (
		<div
			className={cn(
				'fixed inset-x-0 bottom-0 z-40 flex h-12 items-center justify-center bg-(--bg-tertiary) shadow',
				canHide && 'transition-transform duration-300'
			)}
			style={{ transform: isHidden ? 'translateY(140%)' : 'translateY(0)' }}
		>
			<Navbar variant="mobile" />
		</div>
	);
});

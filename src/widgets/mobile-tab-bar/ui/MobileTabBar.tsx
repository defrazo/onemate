import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import NavigationLinks from '@/features/navigation';

const MobileTabBar = () => {
	const { userStore } = useStore();

	const location = useLocation();
	const pathes = ['/', '/terms-of-service', '/privacy-policy', '/about'];

	const [hidden, setHidden] = useState<boolean>(false);
	const lastScroll = useRef(0);
	const scrollTimeout = useRef<number | null>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (!pathes.includes(location.pathname)) {
				setHidden(false);
				return;
			}

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

		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
		};
	}, [location.pathname]);

	return (
		<div
			className="fixed inset-x-0 z-40 flex h-12 w-full items-center justify-around border-t border-solid border-(--border-alt) bg-(--bg-tertiary) shadow transition-all duration-300"
			style={{ bottom: 0, transform: hidden ? 'translateY(100%)' : 'translateY(0)' }}
		>
			<NavigationLinks
				className="no-touch-callout flex h-full w-full items-center justify-around"
				isAuth={Boolean(userStore.id)}
				variant="mobile"
			/>
		</div>
	);
};

export default observer(MobileTabBar);

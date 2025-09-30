import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import NavigationLinks from '@/features/navigation';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MobileTabBar = () => {
	const { userStore } = useStore();

	const location = useLocation();

	const [hidden, setHidden] = useState<boolean>(false);
	const lastScroll = useRef(0);
	const scrollTimeout = useRef<number | null>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (location.pathname === '/') {
				setHidden(false);
				return;
			}

			const currentScroll = window.scrollY;

			if (currentScroll > lastScroll.current + 5) setHidden(true);
			else if (currentScroll < lastScroll.current - 5) setHidden(false);

			if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
			scrollTimeout.current = window.setTimeout(() => (lastScroll.current = currentScroll), 100);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
		};
	}, []);

	return (
		<div
			className="core-elements fixed left-0 z-50 flex h-12 w-full items-center justify-around border-t border-solid border-[var(--color-disabled)] shadow transition-all duration-300"
			style={{ bottom: hidden ? '-48px' : '0px' }}
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

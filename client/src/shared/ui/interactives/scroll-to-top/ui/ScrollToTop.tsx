import { useEffect, useState } from 'react';
import { IconArrowBadgeUpFilled } from '@tabler/icons-react';

import { useDeviceType } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

const BASE_BOTTOM = 16;

export const ScrollToTop = ({ footerSelector = 'footer' }) => {
	const device = useDeviceType();

	const [visible, setVisible] = useState(false);
	const [extraBottom, setExtraBottom] = useState(0);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 300);
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		const footer = document.querySelector<HTMLElement>(footerSelector);
		if (!footer) return;

		const updateOffset = () => {
			const rect = footer.getBoundingClientRect();
			const overlap = Math.max(0, window.innerHeight - rect.top);
			setExtraBottom(overlap > 0 ? overlap + 8 : 0);
		};

		const io = new IntersectionObserver(() => updateOffset(), { root: null, threshold: [0, 1] });

		io.observe(footer);
		window.addEventListener('resize', updateOffset);
		updateOffset();

		return () => {
			io.disconnect();
			window.removeEventListener('resize', updateOffset);
		};
	}, [footerSelector]);

	const bottom = BASE_BOTTOM + (visible ? extraBottom : 0);
	const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

	return (
		<Button
			centerIcon={<IconArrowBadgeUpFilled className="size-6" />}
			className={cn(
				'right-4 z-50 rounded-full p-3 shadow transition-opacity',
				device === 'mobile' ? 'hidden' : 'fixed',
				visible ? 'opacity-100' : 'pointer-events-none opacity-0'
			)}
			size="custom"
			style={{ bottom }}
			title="Наверх"
			onClick={scrollToTop}
		/>
	);
};

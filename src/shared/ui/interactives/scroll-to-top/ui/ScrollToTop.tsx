import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/inputs';

const ScrollToTop = () => {
	const [visible, setVisible] = useState<boolean>(false);

	useEffect(() => {
		const toggleVisibility = () => (window.scrollY > 300 ? setVisible(true) : setVisible(false));
		window.addEventListener('scroll', toggleVisibility);
		return () => window.removeEventListener('scroll', toggleVisibility);
	}, []);

	const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

	return (
		<Button
			centerIcon={<ArrowUp className="size-6" />}
			className={cn(
				'fixed right-6 bottom-6 z-50 rounded-full p-3 shadow transition-all',
				visible ? 'opacity-100' : 'pointer-events-none opacity-0'
			)}
			size="custom"
			title="Наверх"
			onClick={scrollToTop}
		/>
	);
};

export default ScrollToTop;

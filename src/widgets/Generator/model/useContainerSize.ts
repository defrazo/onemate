import { useEffect, useRef, useState } from 'react';

import type { ContainerSize } from '.';

export const useContainerSize = (offset = 32) => {
	const ref = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

	useEffect(() => {
		const update = () => {
			if (!ref.current) return;

			const rect = ref.current.getBoundingClientRect();
			setSize({ width: rect.width - offset, height: rect.height - offset });
		};

		update();
		window.addEventListener('resize', update);
		return () => window.removeEventListener('resize', update);
	}, [offset]);

	return { ref, size };
};

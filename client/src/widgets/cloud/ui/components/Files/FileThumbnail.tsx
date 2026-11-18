import { useEffect, useRef, useState } from 'react';
import type { Icon } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import type { CloudFile } from '../../../model/types';

const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const FileThumbnail = observer(({ file, icon: FileIcon }: { file: CloudFile; icon: Icon }) => {
	const { cloudStore, userStore } = useStore();

	const [loaded, setLoaded] = useState<{ identity: string; url: string } | null>(null);

	const elementRef = useRef<HTMLSpanElement>(null);

	const owner = userStore.id;
	const identity = `${owner}:${file.id}`;

	const supported = SUPPORTED_TYPES.has(file.mimeType);
	const cached = owner && supported ? cloudStore.getCachedThumbnail(file.id) : null;
	const thumbnail = cached ?? (loaded?.identity === identity ? loaded.url : null);

	useEffect(() => {
		const element = elementRef.current;
		if (!element || !owner || !supported || cached) return;
		if (typeof IntersectionObserver === 'undefined') return;

		let active = true;
		let started = false;

		const observer = new IntersectionObserver(
			(entries) => {
				if (started || !entries.some((entry) => entry.isIntersecting)) return;

				started = true;
				observer.disconnect();

				void cloudStore.getThumbnail(file.id).then((url) => {
					if (active && url && userStore.id === owner) setLoaded({ identity, url });
				});
			},
			{ rootMargin: '100px' }
		);

		observer.observe(element);

		return () => {
			active = false;
			observer.disconnect();
		};
	}, [cloudStore, userStore, owner, file.id, identity, supported, cached]);

	return (
		<span ref={elementRef} className="flex size-full items-center justify-center overflow-hidden rounded-lg">
			{thumbnail ? (
				<img alt="" className="size-full object-cover" src={thumbnail} onError={() => setLoaded(null)} />
			) : (
				<FileIcon className="size-5 text-(--accent-primary)" />
			)}
		</span>
	);
});

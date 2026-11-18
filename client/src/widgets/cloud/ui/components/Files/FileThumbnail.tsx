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

	useEffect(() => {
		const element = elementRef.current;

		if (!element || !owner || !SUPPORTED_TYPES.has(file.mimeType)) return;
		if (typeof IntersectionObserver === 'undefined') return;

		const controller = new AbortController();
		let objectUrl: string | null = null;
		let started = false;

		const load = async () => {
			try {
				const blob = await cloudStore.getThumbnail(file.id, controller.signal);

				if (controller.signal.aborted || userStore.id !== owner || blob?.type !== 'image/webp') return;

				objectUrl = URL.createObjectURL(blob);

				const image = new Image();
				image.src = objectUrl;
				await image.decode();

				if (controller.signal.aborted || userStore.id !== owner) return;

				setLoaded({ identity, url: objectUrl });
			} catch {}
		};

		const observer = new IntersectionObserver(
			(entries) => {
				if (started || !entries.some((entry) => entry.isIntersecting)) return;

				started = true;
				observer.disconnect();
				void load();
			},
			{ rootMargin: '100px' }
		);

		observer.observe(element);

		return () => {
			observer.disconnect();
			controller.abort();

			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [cloudStore, userStore, owner, file.id, file.mimeType, identity]);

	const thumbnail = loaded?.identity === identity ? loaded.url : null;

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

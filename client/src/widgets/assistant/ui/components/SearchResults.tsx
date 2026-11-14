import { useState } from 'react';
import {
	autoUpdate,
	flip,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
} from '@floating-ui/react';
import { IconLink } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

import type { SearchSource } from '../../model/types';

const isSafeUrl = (url: string) => {
	try {
		const parsed = new URL(url);
		return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !parsed.username && !parsed.password;
	} catch {
		return false;
	}
};

export const SearchResults = ({ sources }: { sources: SearchSource[] }) => {
	const [open, setOpen] = useState(false);

	const { refs, floatingStyles, context } = useFloating({
		open,
		onOpenChange: setOpen,
		placement: 'bottom-end',
		strategy: 'fixed',
		whileElementsMounted: autoUpdate,
		middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
	});

	const { getReferenceProps, getFloatingProps } = useInteractions([
		useClick(context),
		useDismiss(context),
		useRole(context, { role: 'dialog' }),
	]);

	const safeSources = sources.filter(({ url }) => isSafeUrl(url));
	if (!safeSources.length) return null;

	return (
		<>
			<Button
				{...getReferenceProps()}
				ref={refs.setReference}
				aria-label="Результаты поиска"
				centerIcon={<IconLink className="size-3.5" />}
				className="size-6 rounded-md"
				padding="none"
				title="Результаты поиска"
				variant="iconSurface"
			/>
			{open && (
				<div
					{...getFloatingProps()}
					ref={refs.setFloating}
					aria-label="Результаты поиска"
					className="core-scrollbar z-100 max-h-[min(24rem,calc(100dvh-1rem))] w-80 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-lg border border-(--border-primary) bg-(--bg-secondary) p-3 text-sm text-(--text-primary) shadow-lg"
					style={floatingStyles}
				>
					<p className="mb-2 border-b border-(--border-primary) pb-1 font-semibold">Результаты поиска</p>
					<ul className="flex flex-col gap-2">
						{safeSources.map(({ url, title, domain }) => (
							<li key={url}>
								<a
									className="block rounded-sm wrap-anywhere text-(--accent-primary) hover:underline focus-visible:outline-2 focus-visible:outline-(--accent-primary)"
									href={url}
									rel="noopener noreferrer"
									target="_blank"
								>
									{title}
									<span className="block text-xs text-(--text-secondary)">{domain}</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			)}
		</>
	);
};

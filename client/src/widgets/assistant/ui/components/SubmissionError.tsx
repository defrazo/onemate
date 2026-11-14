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
import { IconAlertCircle } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

interface SubmissionErrorProps {
	error: string;
	disabled: boolean;
	onRepeat: () => void;
}

export const SubmissionError = ({ error, disabled, onRepeat }: SubmissionErrorProps) => {
	const [open, setOpen] = useState(false);

	const { refs, floatingStyles, context } = useFloating({
		open,
		onOpenChange: setOpen,
		placement: 'top-end',
		strategy: 'fixed',
		whileElementsMounted: autoUpdate,
		middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
	});

	const { getReferenceProps, getFloatingProps } = useInteractions([
		useClick(context),
		useDismiss(context),
		useRole(context, { role: 'dialog' }),
	]);

	return (
		<>
			<Button
				{...getReferenceProps()}
				ref={refs.setReference}
				aria-label="Ошибка отправки"
				centerIcon={<IconAlertCircle className="size-4" />}
				className="size-6 shrink-0 rounded-md text-(--status-error)"
				padding="none"
				title="Ошибка отправки"
				variant="icon"
			/>
			{open && (
				<div
					{...getFloatingProps()}
					ref={refs.setFloating}
					aria-label="Ошибка отправки"
					className="z-100 flex w-64 max-w-[calc(100vw-1rem)] flex-col gap-2 rounded-lg border border-(--border-primary) bg-(--bg-secondary) p-3 text-sm text-(--text-primary) shadow-lg"
					style={floatingStyles}
				>
					<span>{error}</span>
					<Button className="mx-auto h-7 text-xs" disabled={disabled} variant="accent" onClick={onRepeat}>
						Повторить отправку
					</Button>
				</div>
			)}
		</>
	);
};

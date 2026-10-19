import { useEffect } from 'react';
import {
	IconArrowBackUp,
	IconArrowForwardUp,
	IconCheck,
	IconClipboard,
	IconCopy,
	IconCut,
	IconEraser,
	IconSelectAll,
} from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useTextEditor } from '@/shared/lib/hooks';
import { Divider, EditorAction, Textarea } from '@/shared/ui';

import { CLOUD_LIMITS } from '../../../model';

export const Clipboard = observer(() => {
	const { cloudStore: store } = useStore();

	const { textareaRef, feedback, undo, redo, cut, copy, paste, selectAll, clear } = useTextEditor(
		CLOUD_LIMITS.TEXT_LENGTH
	);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') void store.refreshText();
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [store]);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<Textarea
				ref={textareaRef}
				className="min-h-0 flex-1 scrollbar-none p-0 text-base"
				disabled={store.isResolvingTextConflict}
				id="clipboard"
				maxLength={CLOUD_LIMITS.TEXT_LENGTH}
				placeholder="Текст, ссылка, команда или что-нибудь ещё..."
				resize="none"
				value={store.text}
				variant="custom"
				onChange={(event) => store.setText(event.target.value)}
			/>
			<div className="flex shrink-0 items-center justify-between gap-2 pt-2">
				<div className="hidden h-6.5 items-center rounded-md bg-(--accent-primary-muted) px-2 text-xs text-nowrap text-(--accent-primary) tabular-nums lg:flex">
					{store.text.length} / {CLOUD_LIMITS.TEXT_LENGTH} зн.
				</div>
				<div className="ml-auto flex items-center md:gap-1">
					<EditorAction
						icon={feedback === 'undo' ? IconCheck : IconArrowBackUp}
						title="Отменить"
						onClick={undo}
					/>
					<EditorAction
						icon={feedback === 'redo' ? IconCheck : IconArrowForwardUp}
						title="Повторить"
						onClick={redo}
					/>
					<Divider className="my-auto h-4" direction="Y" margX="sm" />
					<EditorAction icon={feedback === 'cut' ? IconCheck : IconCut} title="Вырезать" onClick={cut} />
					<EditorAction
						icon={feedback === 'paste' ? IconCheck : IconClipboard}
						title="Вставить"
						onClick={() => void paste()}
					/>
					<EditorAction
						icon={feedback === 'copy' ? IconCheck : IconCopy}
						title="Копировать выделенное"
						onClick={copy}
					/>
					<Divider className="my-auto h-4" direction="Y" margX="sm" />
					<EditorAction
						icon={feedback === 'select' ? IconCheck : IconSelectAll}
						title="Выделить всё"
						onClick={selectAll}
					/>
					<EditorAction
						icon={feedback === 'clear' ? IconCheck : IconEraser}
						title="Очистить"
						onClick={clear}
					/>
				</div>
			</div>
		</div>
	);
});

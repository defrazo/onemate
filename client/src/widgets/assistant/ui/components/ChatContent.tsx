import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, LoadingState } from '@/shared/ui';

import { Composer } from './Composer';
import { Messages } from './Messages';
import { SubmissionError } from './SubmissionError';

export const ChatContent = observer(() => {
	const { assistantStore: store } = useStore();

	const recovery = store.submissionRecovery;
	const generating = store.phase === 'stopping' || store.generating;

	return (
		<>
			<Messages
				before={store.before}
				canRetry={store.canSend}
				error={null}
				historyError={store.historyError}
				loadingHistory={store.loadingHistory}
				messages={store.visibleMessages}
				phase={store.phase === 'error' && store.error === recovery?.error ? 'idle' : store.phase}
				recovery={recovery ? { ...recovery, onRepeat: () => void store.repeatSubmission() } : null}
				regenerateMessageId={store.regenerateMessageId}
				submittedMessageId={store.lastSubmittedMessageId}
				onOlder={() => void store.loadOlder()}
				onRegenerate={(id) => void store.regenerate(id)}
				onRetry={(id) => void store.retry(id)}
			/>
			{generating && (
				<div className="mr-auto flex items-center gap-2">
					<LoadingState size="xs" />
					<span className="shrink-0 text-sm text-(--text-disabled)" role="status">
						{store.phase === 'stopping' ? 'Останавливаем…' : 'Ожидаем ответ…'}
					</span>
				</div>
			)}
			{store.error && store.error !== recovery?.error && (
				<span className="text-xs text-(--status-error)" role="alert">
					{store.error}
				</span>
			)}
			{store.error && (
				<Button className="text-xs" disabled={store.busy} onClick={() => void store.load()}>
					Обновить диалог
				</Button>
			)}
			<Composer
				canSend={store.canSend}
				mode={store.mode}
				phase={store.phase}
				recovery={
					recovery && !recovery.messageId ? (
						<SubmissionError
							disabled={recovery.disabled}
							error={recovery.error}
							onRepeat={() => void store.repeatSubmission()}
						/>
					) : null
				}
				value={store.input}
				onChange={store.setInput}
				onSend={() => void store.send()}
				onStop={() => void store.stop()}
			/>
		</>
	);
});

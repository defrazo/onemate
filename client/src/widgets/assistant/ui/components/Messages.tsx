import { useLayoutEffect, useRef, useState } from 'react';
import { IconArrowDown, IconCopy, IconMessageSearch, IconRefresh, IconRobot } from '@tabler/icons-react';

import { useCopy } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button, LoadingState, NoContent, Tooltip } from '@/shared/ui';

import { messageScrollTarget } from '../../lib/scroll';
import type { AssistantMessage, AssistantPhase } from '../../model/types';
import { MarkdownBlock } from './Markdown';
import { SearchResults } from './SearchResults';
import { SubmissionError } from './SubmissionError';

interface MessagesProps {
	recovery?: { error: string; messageId: string | null; disabled: boolean; onRepeat: () => void } | null;
	submittedMessageId?: string | null;
	regenerateMessageId?: string | null;
	onRegenerate?: (id: string) => void;
	readOnly?: boolean;
	messages: AssistantMessage[];
	phase: AssistantPhase;
	error: string | null;
	before: number | null;
	loadingHistory: boolean;
	historyError: string | null;
	canRetry: boolean;
	onOlder: () => void;
	onRetry: (id: string) => void;
}

export const Messages = ({
	recovery = null,
	submittedMessageId = null,
	regenerateMessageId = null,
	onRegenerate,
	readOnly = false,
	messages,
	phase,
	error,
	before,
	loadingHistory,
	historyError,
	canRetry,
	onOlder,
	onRetry,
}: MessagesProps) => {
	const copy = useCopy();
	const list = useRef<HTMLDivElement>(null);
	const anchor = useRef<{ id: string; top: number } | null>(null);
	const previousLastId = useRef<string | null>(null);
	const previousSubmittedId = useRef(submittedMessageId);
	const manual = useRef(false);
	const [showDown, setShowDown] = useState(false);
	const updateDown = () => {
		const element = list.current;
		if (element) setShowDown(element.scrollHeight - element.scrollTop - element.clientHeight > 48);
	};
	useLayoutEffect(() => {
		if (loadingHistory) return;
		const element = list.current;
		if (!element) return;
		if (anchor.current) {
			const previous = anchor.current;
			const item = Array.from(element.querySelectorAll<HTMLElement>('[data-message-id]')).find(
				(node) => node.dataset.messageId === previous.id
			);
			if (item) element.scrollTop += item.getBoundingClientRect().top - previous.top;
			anchor.current = null;
		} else {
			const submitted =
				submittedMessageId !== previousSubmittedId.current
					? messages.find((message) => message.id === submittedMessageId)
					: undefined;
			const target = submitted ?? messageScrollTarget(previousLastId.current, messages, manual.current);
			if (submitted) manual.current = false;
			if (target === 'end') element.scrollTop = element.scrollHeight;
			else if (target) {
				const item = Array.from(element.querySelectorAll<HTMLElement>('[data-message-id]')).find(
					(node) => node.dataset.messageId === target.id
				);
				if (item) element.scrollTop += item.getBoundingClientRect().top - element.getBoundingClientRect().top;
			}
		}
		previousLastId.current = messages.at(-1)?.id ?? null;
		previousSubmittedId.current = submittedMessageId;
		if (!messages.length) manual.current = false;
		updateDown();
	}, [messages, loadingHistory, submittedMessageId]);
	return (
		<div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
			<div
				ref={list}
				aria-busy={phase === 'loading' || phase === 'generating'}
				// className="min-h-0 min-w-0 flex-1 scrollbar-none space-y-2 overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg pb-10 select-text [overflow-anchor:none]"
				className="core-scrollbar min-h-0 min-w-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg select-text [overflow-anchor:none]"
				onKeyDown={(event) => {
					if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key))
						manual.current = true;
				}}
				onPointerDown={() => (manual.current = true)}
				onScroll={() => {
					const element = list.current;
					if (element && element.scrollHeight - element.scrollTop - element.clientHeight <= 48)
						manual.current = false;
					updateDown();
				}}
				onTouchMove={() => (manual.current = true)}
				onWheel={() => (manual.current = true)}
			>
				{before !== null && (
					<Button
						className="text-xs"
						disabled={loadingHistory}
						onClick={() => {
							manual.current = true;
							const element = list.current;
							const first = element
								? Array.from(element.querySelectorAll<HTMLElement>('[data-message-id]')).find(
										(node) =>
											node.getBoundingClientRect().bottom > element.getBoundingClientRect().top
									)
								: null;
							anchor.current = first
								? { id: first.dataset.messageId!, top: first.getBoundingClientRect().top }
								: null;
							onOlder();
						}}
					>
						{loadingHistory ? 'Загрузка…' : 'Предыдущие сообщения'}
					</Button>
				)}
				{historyError && (
					<span className="text-xs text-(--status-error)/70" role="alert">
						{historyError}
					</span>
				)}
				{!messages.length && phase !== 'loading' && (
					<NoContent
						description="Выберите режим и напишите сообщение"
						icon={readOnly ? IconMessageSearch : IconRobot}
						title={readOnly ? 'В диалоге нет сообщений' : 'Чем помочь?'}
					/>
				)}
				{messages.map((message) => (
					<article
						key={message.id}
						className={cn(
							'min-w-0 rounded-lg p-2 text-sm',
							message.role === 'user' && 'bg-(--tone-strong)'
						)}
						data-message-id={message.id}
					>
						<div className="core-scrollbar mb-0.5 flex items-center justify-between gap-2 text-xs text-(--text-secondary)">
							<span className="select-none">{message.role === 'user' ? 'Вы' : 'Mate AI'}</span>
							<div className="flex shrink-0 items-center gap-0.5">
								{!readOnly &&
									message.generation &&
									message.id === regenerateMessageId &&
									onRegenerate && (
										<Tooltip content="Сгенерировать заново">
											<Button
												aria-label="Сгенерировать заново"
												centerIcon={<IconRefresh className="size-3.5" />}
												className="size-6 rounded-md"
												disabled={!canRetry}
												padding="none"
												title="Сгенерировать заново"
												variant="iconSurface"
												onClick={() => onRegenerate(message.generation!.id)}
											/>
										</Tooltip>
									)}
								<Tooltip content="Копировать">
									<Button
										aria-label="Копировать сообщение"
										centerIcon={<IconCopy className="size-3.5" />}
										className="size-6 rounded-md"
										padding="none"
										title="Копировать"
										variant="iconSurface"
										onClick={() => copy(message.content)}
									/>
								</Tooltip>
								{!readOnly && message.role === 'user' && recovery?.messageId === message.id && (
									<SubmissionError
										disabled={recovery.disabled}
										error={recovery.error}
										onRepeat={recovery.onRepeat}
									/>
								)}
								{message.role === 'assistant' && message.generation && (
									<SearchResults sources={message.generation.sources} />
								)}
							</div>
						</div>
						{message.role === 'assistant' ? (
							<MarkdownBlock content={message.content} />
						) : (
							<span className="wrap-anywhere whitespace-pre-wrap">{message.content}</span>
						)}
						{message.generation && ['failed', 'cancelled'].includes(message.generation.status) && (
							<footer className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-(--text-disabled) select-none">
								{message.generation.status === 'failed' && <span>Не удалось получить ответ</span>}
								{message.generation.status === 'cancelled' && <span>Генерация отменена</span>}
								{!readOnly &&
									message.role === 'user' &&
									!messages.some(
										(item) => item.role === 'assistant' && item.reply_to_message_id === message.id
									) &&
									['failed', 'cancelled'].includes(message.generation.status) && (
										<Button
											className="rounded-md text-xs"
											disabled={!canRetry}
											padding="xs"
											onClick={() => onRetry(message.generation!.id)}
										>
											Повторить
										</Button>
									)}
							</footer>
						)}
					</article>
				))}
				{phase === 'loading' && <LoadingState size="md" />}
				{phase === 'error' && (
					<span className="text-sm text-(--status-error)/80" role="alert">
						{error ?? 'Не удалось загрузить диалог'}
					</span>
				)}
			</div>
			{showDown && (
				<div className="absolute right-2 bottom-2">
					<Button
						aria-label="К последним сообщениям"
						centerIcon={<IconArrowDown className="size-3.5" />}
						className="size-7 rounded-full shadow-md"
						padding="none"
						title="Вниз — к последним сообщениям"
						variant="iconSurface"
						onClick={() => {
							const element = list.current;
							if (element) element.scrollTop = element.scrollHeight;
							manual.current = false;
							updateDown();
						}}
					/>
				</div>
			)}
		</div>
	);
};

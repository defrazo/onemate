/**
 * useTextEditor – хук для управления текстовым полем.
 *
 * Предоставляет операции отмены, повтора, вырезания, копирования,
 * вставки, выделения и очистки текста с визуальной обратной связью.
 *
 * При вставке проверяет максимальную длину текста и показывает
 * уведомления через notifyStore.
 *
 * @param maxLength – максимальное количество символов.
 * @returns textareaRef, feedback и функции управления текстом.
 *
 * Пример:
 *   const editor = useTextEditor(10000);
 *
 *   <Textarea ref={editor.textareaRef} />
 *   <Button onClick={editor.paste}>Вставить</Button>
 */

import { useEffect, useRef, useState } from 'react';

import { useStore } from '@/app/providers';

type EditorFeedback = 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'select' | 'clear' | null;

export const useTextEditor = (maxLength: number) => {
	const { notifyStore } = useStore();

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const feedbackTimerRef = useRef<number | null>(null);

	const [feedback, setFeedback] = useState<EditorFeedback>(null);

	useEffect(() => {
		return () => {
			if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
		};
	}, []);

	const showFeedback = (action: EditorFeedback) => {
		if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);

		setFeedback(action);

		feedbackTimerRef.current = window.setTimeout(() => {
			setFeedback(null);
			feedbackTimerRef.current = null;
		}, 700);
	};

	const undo = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.focus();

		if (document.execCommand('undo')) showFeedback('undo');
	};

	const redo = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.focus();

		if (document.execCommand('redo')) showFeedback('redo');
	};

	const cut = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		if (textarea.selectionStart === textarea.selectionEnd) return;

		textarea.focus();

		if (document.execCommand('cut')) showFeedback('cut');
	};

	const copy = async () => {
		const textarea = textareaRef.current;
		if (!textarea || !textarea.value) return;

		const { selectionStart, selectionEnd, value } = textarea;

		const text = selectionStart !== selectionEnd ? value.slice(selectionStart, selectionEnd) : value;

		try {
			await navigator.clipboard.writeText(text);
			showFeedback('copy');
		} catch {
			notifyStore.setNotice('Не удалось скопировать текст', 'error');
		}
	};

	const paste = async () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;

		try {
			const text = await navigator.clipboard.readText();

			if (textarea.value.length - (end - start) + text.length > maxLength) {
				notifyStore.setNotice(`Максимум ${maxLength} символов`, 'info');
				return;
			}

			textarea.focus();
			textarea.setSelectionRange(start, end);

			if (document.execCommand('insertText', false, text)) showFeedback('paste');
		} catch {
			notifyStore.setNotice('Не удалось получить доступ к буферу обмена', 'error');
		}
	};

	const selectAll = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.focus();
		textarea.select();

		showFeedback('select');
	};

	const clear = () => {
		const textarea = textareaRef.current;
		if (!textarea || !textarea.value) return;

		textarea.focus();
		textarea.select();

		if (document.execCommand('delete')) showFeedback('clear');
	};

	return { textareaRef, feedback, undo, redo, cut, copy, paste, selectAll, clear };
};

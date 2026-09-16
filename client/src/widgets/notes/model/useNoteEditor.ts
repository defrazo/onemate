import { useRef, useState } from 'react';

import { useStore } from '@/app/providers';

import { NOTE_MAX_LENGTH } from '.';

type EditorFeedback = 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'select' | 'clear' | null;

export const useNoteEditor = () => {
	const { notifyStore } = useStore();

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const feedbackTimerRef = useRef<number | null>(null);

	const [feedback, setFeedback] = useState<EditorFeedback>(null);

	const showFeedback = (action: EditorFeedback) => {
		if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);

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

	const copy = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		if (textarea.selectionStart === textarea.selectionEnd) return;

		textarea.focus();

		if (document.execCommand('copy')) showFeedback('copy');
	};

	const paste = async () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		try {
			const text = await navigator.clipboard.readText();

			if (
				textarea.value.length - (textarea.selectionEnd - textarea.selectionStart) + text.length >
				NOTE_MAX_LENGTH
			) {
				notifyStore.setNotice(`Максимум ${NOTE_MAX_LENGTH} символов`, 'info');
				return;
			}

			textarea.focus();
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

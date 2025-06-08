import { forwardRef, useEffect, useState } from 'react';

import { cn } from '@/shared/lib/utils';
import { Preloader, Textarea } from '@/shared/ui';

interface NotesWidgetProps {
	className?: string;
}

const NotesWidget = forwardRef<HTMLDivElement, NotesWidgetProps>((props, ref) => {
	const [textareas, setTextareas] = useState<string[]>(['', '', '', '', '']);
	const [loading, setLoading] = useState<boolean>(true);

	const handleTextareaSave = (updatedTextareas: string[]) => {
		localStorage.setItem('notes', JSON.stringify(updatedTextareas));
	};

	const handleTextareaChange = (index: number, event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setTextareas((prevTextareas) => {
			const updatedTextareas = [...prevTextareas];
			updatedTextareas[index] = event.target.value;
			handleTextareaSave(updatedTextareas);

			return updatedTextareas;
		});
	};

	const handleTextareaFocusBlur = (index: number, focus: boolean) => {
		const textarea = document.getElementById(`textarea-${index}`);
		if (textarea instanceof HTMLTextAreaElement) {
			const textareaHeight = textarea.scrollHeight;
			const rows = Math.ceil(textareaHeight / 16);
			focus ? (textarea.rows = rows) : (textarea.rows = 1);
			if (!focus) handleTextareaSave(textareas);
		}
	};

	const handleTextareaClear = (index: number) => {
		const textarea = document.getElementById(`textarea-${index}`) as HTMLTextAreaElement;

		if (index !== undefined && textarea && textarea.value !== '') {
			const isConfirmed = window.confirm('Удалить содержимое данного поля?');

			if (isConfirmed) {
				setTextareas((prevTextareas) => {
					const updatedTextareas = [...prevTextareas];
					updatedTextareas[index] = '';
					handleTextareaSave(updatedTextareas);

					return updatedTextareas;
				});
			}
		}
	};

	useEffect(() => {
		const emptyTextareas = textareas.filter((value) => value === '');

		if (textareas.every((textarea) => textarea.trim() !== '')) {
			setTextareas((prevTextareas) => [...prevTextareas, '']);
		}

		if (emptyTextareas.length > 1 && textareas.length > 5) {
			setTextareas((prevTextareas) => {
				const updatedTextareas = prevTextareas.filter((value, index) => !(value === '' && index > 0));

				return updatedTextareas;
			});
		}
	}, [textareas]);

	useEffect(() => {
		const savedTextareas = localStorage.getItem('notes');

		if (savedTextareas) {
			setTextareas(JSON.parse(savedTextareas));
		}

		setLoading(false);
	}, []);

	const [maxHeight, setMaxHeight] = useState(window.innerHeight * 0.6);

	useEffect(() => {
		const handleResize = () => {
			setMaxHeight(window.innerHeight * 0.6);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);
	return (
		<div
			ref={ref}
			{...props}
			className={cn('core-card core-base flex flex-2 flex-col gap-2 shadow-[var(--shadow)]', props.className)}
		>
			<span className="core-header">Заметки</span>
			{loading ? (
				<div className="flex flex-1 items-center justify-center">
					<Preloader className="size-25" />
				</div>
			) : (
				<div
					// className={`max-h-${maxHeight} flex flex-col justify-between gap-2 overflow-y-auto`}
					className={`flex grow flex-col justify-between gap-2 overflow-y-auto`}
					// style={{ maxHeight }}
				>
					{textareas.map((value, index) => (
						// <div className="relative mr-1 flex min-h-20 grow" key={index}>
						<div key={index} className="relative flex min-h-0 grow">
							<Textarea
								key={index}
								id={`textarea-${index}`}
								placeholder="..."
								resize="none"
								rows={1}
								value={value}
								variant="ghost"
								onBlur={() => handleTextareaFocusBlur(index, false)}
								onChange={(event) => handleTextareaChange(index, event)}
								onFocus={() => handleTextareaFocusBlur(index, true)}
							/>
							<span
								key={`clr-${index}`}
								className="font-base absolute right-2 cursor-pointer"
								title="Очистить"
								onClick={() => handleTextareaClear(index)}
							>
								x
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
});

export default NotesWidget;

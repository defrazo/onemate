import { cn } from '@/shared/lib/utils';

interface DragHandleProps {
	bind: ReturnType<typeof import('@use-gesture/react').useDrag>;
	getLineClass: (line: 'top' | 'bottom') => string;
}

export const DragHandle = ({ bind, getLineClass }: DragHandleProps) => {
	const lineStyle =
		'absolute block h-1 origin-center rounded-xl bg-[var(--color-primary)] transition-all duration-300';

	return (
		<div
			{...bind()}
			className="drag-handle relative flex h-8 cursor-grab items-center justify-center bg-transparent select-none"
			style={{ touchAction: 'none' }}
		>
			<span className={cn(lineStyle, getLineClass('top'))} />
			<span className={cn(lineStyle, getLineClass('bottom'))} />
		</div>
	);
};

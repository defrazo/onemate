import { cn } from '@/shared/lib/utils';

interface DragHandleProps {
	getLineClass: (line: 'top' | 'bottom') => string;
}

export const DragHandle = ({ getLineClass }: DragHandleProps) => {
	const lineStyle = 'absolute block h-1 origin-center rounded-xl bg-(--color-primary) transition-all duration-300';

	return (
		<div className="drag-handle relative flex h-8 cursor-grab items-center justify-center bg-transparent select-none">
			<span className={cn(lineStyle, getLineClass('top'))} />
			<span className={cn(lineStyle, getLineClass('bottom'))} />
		</div>
	);
};

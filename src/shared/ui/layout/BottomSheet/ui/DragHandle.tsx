import { cn } from '@/shared/lib/utils';

interface DragHandleProps {
	bind: ReturnType<typeof import('@use-gesture/react').useDrag>;
	getLineClass: (line: 'top' | 'bottom') => string;
}

const DragHandle = ({ bind, getLineClass }: DragHandleProps) => {
	return (
		<div
			{...bind()}
			className="drag-handle relative flex h-8 cursor-grab items-center justify-center bg-transparent select-none"
			style={{ touchAction: 'none' }}
		>
			<span
				className={cn(
					'absolute block h-1 origin-center rounded-xl bg-[var(--color-primary)] transition-all duration-300',
					getLineClass('top')
				)}
			/>
			<span
				className={cn(
					'absolute block h-1 origin-center rounded-xl bg-[var(--color-primary)] transition-all duration-300',
					getLineClass('bottom')
				)}
			/>
		</div>
	);
};

export default DragHandle;

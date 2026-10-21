import { pluralize } from '@/shared/lib/utils';

export const Status = ({ count }: { count: number }) => {
	return (
		<div className="hidden items-center justify-end border-t border-(--border-primary) pt-2 md:pt-3 lg:hidden xl:flex">
			<div className="flex h-6 items-center rounded-md bg-(--accent-primary-muted) px-2 text-xs text-(--accent-primary)">
				{count} {pluralize(count, 'вычисление', 'вычисления', 'вычислений')}
			</div>
		</div>
	);
};

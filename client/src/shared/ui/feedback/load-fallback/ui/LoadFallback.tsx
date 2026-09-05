import { Preloader } from '@/shared/ui';

const LoadFallback = () => (
	<div className="flex h-full flex-1 items-center justify-center">
		<Preloader className="size-25 border-t-(--border-color)" />
	</div>
);

export default LoadFallback;

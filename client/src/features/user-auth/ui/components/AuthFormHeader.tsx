import { Logo } from '@/shared/ui';

export const AuthFormHeader = ({ title }: { title: string }) => {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex flex-col items-center gap-2 select-none">
				<Logo className="top-4 left-4 mb-4" />
				<h2 className="text-center text-2xl font-semibold">{title}</h2>
			</div>
		</div>
	);
};

import type { Icon } from '@tabler/icons-react';

export const InputLabel = ({ icon: Icon, htmlFor }: { icon: Icon; htmlFor?: string }) => (
	<label className="flex cursor-text items-center border-r border-(--border-color)" htmlFor={htmlFor}>
		<Icon className="mr-1.5 ml-1 size-5.5" />
	</label>
);

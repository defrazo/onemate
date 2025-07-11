import { toast } from 'sonner';

import { IconError, IconInfo, IconSuccess, IconWarning } from '@/shared/assets/icons';

import { cn } from '../../utils';
import { iconColor, leftBorder } from '../lib';
import type { ToastProps } from '../model';

const iconMap = {
	success: <IconSuccess />,
	error: <IconError />,
	warning: <IconWarning />,
	info: <IconInfo />,
};

export const Toast = ({ toastId, type, message, options }: ToastProps) => {
	const Icon = iconMap[type];
	return (
		<div className={options?.className} style={options?.style} onClick={() => toast.dismiss(toastId)}>
			<div
				className={cn(
					'flex items-center justify-center gap-2 rounded-xl border border-l-4 border-[var(--border-color)] bg-[rgba(255,255,255,0.2)] p-2 shadow-lg backdrop-blur-md select-none',
					leftBorder(type)
				)}
			>
				<div className={cn('size-8 py-1', iconColor(type))}>{Icon}</div>
				<div className="flex-1 text-sm">
					<p>{message}</p>
					{options?.description && <p className="opacity-75">{options.description}</p>}
				</div>
				{options?.button && <div>{options.button}</div>}
			</div>
		</div>
	);
};

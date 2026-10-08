import { IconAlertTriangle, IconCircleCheck, IconCircleX, IconInfoCircle } from '@tabler/icons-react';
import { toast } from 'sonner';

import { cn } from '@/shared/lib/utils';

import type { NotifyType, ToastOptions } from '../model';

export const toastStyles: Record<NotifyType, string> = {
	success: 'bg-(--status-success-muted) text-(--status-success)',
	error: 'bg-(--status-error-muted) text-(--status-error)',
	warning: 'bg-(--status-warning-muted) text-(--status-warning)',
	info: 'bg-(--status-info-muted) text-(--status-info)',
};

const iconMap = {
	success: IconCircleCheck,
	error: IconCircleX,
	warning: IconAlertTriangle,
	info: IconInfoCircle,
};

interface ToastProps {
	toastId: string | number;
	type: NotifyType;
	message: string;
	options?: ToastOptions;
}

export const Toast = ({ toastId, type, message, options }: ToastProps) => {
	const Icon = iconMap[type];

	return (
		<div className={options?.className} style={options?.style} onClick={() => toast.dismiss(toastId)}>
			<div className="core-surface core-tone flex min-w-64 items-center gap-2.5 bg-(--bg-secondary)/95 px-3 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl select-none not-xl:mt-px">
				<div className={cn('flex size-7 shrink-0 items-center justify-center rounded-md', toastStyles[type])}>
					<Icon className="size-4.5" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-sm text-(--text-primary)">{message}</p>
					{options?.description && (
						<p className="mt-0.5 text-xs leading-relaxed text-(--text-secondary)">{options.description}</p>
					)}
				</div>
				{options?.button && <div className="shrink-0">{options.button}</div>}
			</div>
		</div>
	);
};

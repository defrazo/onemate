import { toast } from 'sonner';

import { Toast } from '../ui';
import type { NotifyType, ToastOptions } from '.';

const notifyFunction = (type: NotifyType) => (message: string, options?: ToastOptions) => {
	toast.custom((toastId) => <Toast message={message} options={options} toastId={toastId} type={type} />, {
		duration: options?.duration,
		position: options?.position,
		onAutoClose: options?.onAutoClose,
		onDismiss: options?.onDismiss,
	});
};

export const notify = {
	success: notifyFunction('success'),
	error: notifyFunction('error'),
	warning: notifyFunction('warning'),
	info: notifyFunction('info'),
};

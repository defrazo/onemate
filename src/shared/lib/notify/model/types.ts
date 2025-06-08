export type NotifyType = 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
	description?: string;
	duration?: number;
	important?: boolean;
	position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
	style?: React.CSSProperties;
	button?: React.ReactNode;
	className?: string;
	onAutoClose?: () => void;
	onDismiss?: () => void;
	onClick?: () => void;
};

export interface ToastProps {
	toastId: string | number;
	type: NotifyType;
	message: string;
	options?: ToastOptions;
}

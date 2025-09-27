import { IconGoogle } from '@/shared/assets/icons';
import { Button, Tooltip } from '@/shared/ui';

interface AuthSocialProps {
	isLoading: boolean;
	oAuth: () => void;
	demoAuth?: () => void;
}

export const AuthSocial = ({ isLoading, oAuth, demoAuth }: AuthSocialProps) => {
	return (
		<>
			{demoAuth && (
				<Tooltip className="w-full" content="Запустить демо-режим">
					<Button
						className="flex h-10 w-full gap-2 text-sm opacity-50 hover:opacity-100 md:text-base"
						loading={isLoading}
						variant="ghost"
						onClick={demoAuth}
					>
						Войти как гость
					</Button>
				</Tooltip>
			)}
			<Button
				className="flex h-10 w-full gap-2 text-sm md:text-base"
				loading={isLoading}
				variant="ghost"
				onClick={oAuth}
			>
				Продолжить с аккаунтом Google <IconGoogle className="size-5" />
			</Button>
		</>
	);
};

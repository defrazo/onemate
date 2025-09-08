import { IconGoogle } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

interface AuthSocialProps {
	isLoading: boolean;
	oAuth: () => void;
}

export const AuthSocial = ({ isLoading, oAuth }: AuthSocialProps) => {
	return (
		<Button className="flex h-10 w-full gap-2" loading={isLoading} variant="ghost" onClick={oAuth}>
			Продолжить с аккаунтом Google <IconGoogle className="size-5" />
		</Button>
	);
};

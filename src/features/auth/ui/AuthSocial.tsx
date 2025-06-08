import { Provider } from '@supabase/supabase-js';

import { IconGoogle } from '@/shared/assets/icons';
import { notify } from '@/shared/lib/notify';
import { Button } from '@/shared/ui';

import { supabase } from '../lib';

interface AuthSocialProps {}

export const AuthSocial = ({}: AuthSocialProps) => {
	const onOAuthLogin = async (provider: Provider) => {
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (error) throw error;
		} catch {
			notify.error('Ошибка входа через Google');
		}
	};

	return (
		<div className="flex w-full flex-col gap-2">
			<Button className="flex h-8 gap-2" onClick={() => onOAuthLogin('google')}>
				Войти с аккаунтом Google <IconGoogle className="h-5 w-5" />
			</Button>
		</div>
	);
};

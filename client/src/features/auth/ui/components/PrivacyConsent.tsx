import { Checkbox } from '@/shared/ui';

export const PrivacyConsent = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => {
	return (
		<label className="mx-auto flex w-full items-start justify-center gap-1.5 text-sm leading-[1.15] text-(--text-secondary) select-none">
			<Checkbox checked={checked} className="size-4" onChange={onChange} />
			<span>
				Я принимаю{' '}
				<a
					className="text-(--accent-primary) hover:underline"
					href="/terms"
					rel="noopener noreferrer"
					target="_blank"
				>
					условия использования
				</a>{' '}
				и ознакомлен с{' '}
				<a
					className="text-(--accent-primary) hover:underline"
					href="/privacy"
					rel="noopener noreferrer"
					target="_blank"
				>
					политикой конфиденциальности
				</a>
			</span>
		</label>
	);
};

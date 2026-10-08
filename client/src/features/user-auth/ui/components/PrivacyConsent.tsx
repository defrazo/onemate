import { Checkbox } from '@/shared/ui';

export const PrivacyConsent = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => {
	return (
		<label className="mx-auto -mb-2 flex w-full items-start justify-center gap-3 text-xs text-(--text-secondary) select-none md:text-sm">
			<Checkbox checked={checked} className="mt-0.5" onChange={onChange} />
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

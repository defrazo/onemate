export const PrivacyConsent = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => {
	return (
		<label className="mx-auto mt-1 flex w-full items-start justify-center gap-3 text-xs text-(--color-secondary) select-none md:mt-0 md:text-sm">
			<input
				checked={checked}
				className="mt-0.5 size-4"
				required
				type="checkbox"
				onChange={(e) => onChange(e.target.checked)}
			/>
			<span>
				Я принимаю{' '}
				<a
					className="text-(--accent-default) hover:underline"
					href="/terms"
					rel="noopener noreferrer"
					target="_blank"
				>
					условия использования
				</a>{' '}
				и ознакомлен с{' '}
				<a
					className="text-(--accent-default) hover:underline"
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

interface PrivacyConsentProps {
	checked: boolean;
	onChange: (value: boolean) => void;
}

export const PrivacyConsent = ({ checked, onChange }: PrivacyConsentProps) => {
	return (
		<label className="mx-auto mt-1 flex w-full items-center justify-center gap-3 text-xs text-(--color-secondary) select-none md:mt-0 md:text-sm">
			<input
				checked={checked}
				className="size-4"
				required
				type="checkbox"
				onChange={(e) => onChange(e.target.checked)}
			/>
			<span>
				Я даю согласие на{' '}
				<a
					className="text-(--accent-primary) hover:underline"
					href="/privacy-policy"
					rel="noopener noreferrer"
					target="_blank"
				>
					обработку персональных данных
				</a>
			</span>
		</label>
	);
};

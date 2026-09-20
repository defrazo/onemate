import { SelectExt } from '@/shared/ui';

const languages = [
	{ key: 'ru', label: 'Русский', value: 'ru' },
	{ key: 'en', label: 'English', value: 'en' },
];

export const LanguageSection = () => {
	return (
		<section className="flex items-center justify-between select-none">
			<div className="flex items-center gap-2">
				<p className="text-sm whitespace-nowrap text-(--color-secondary) opacity-70 xl:text-base">
					Язык интерфейса
				</p>
				<span className="trim hidden h-4 rounded-md bg-(--bg-tertiary) px-1.5 py-1 text-[10px] text-(--color-secondary) xl:block">
					Скоро
				</span>
			</div>
			<SelectExt
				addStyle="my-1 -mr-1 max-w-52"
				className="ml-auto max-w-36 xl:max-w-52"
				disabled
				options={languages}
				value="ru"
				onChange={() => {}}
			/>
		</section>
	);
};

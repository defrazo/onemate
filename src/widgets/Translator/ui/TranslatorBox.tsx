import { observer } from 'mobx-react-lite';

import { useDebouncedEffect } from '@/shared/lib/hooks';
import { cn, copyExt } from '@/shared/lib/utils';
import { Preloader, SelectExt, Textarea } from '@/shared/ui';

import { translatorStore } from '../model';
import { TranslatorBoxActions } from '.';

interface TranslatorBoxProps {
	text: string;
	language: string;
	type: 'source' | 'target';
	loading?: boolean;
	onChangeLanguage: (value: string) => void;
	onChangeText?: (value: string) => void;
	onClearTextbox: () => void;
}

export const TranslatorBox = observer(
	({ text, language, type, loading, onChangeLanguage, onChangeText, onClearTextbox }: TranslatorBoxProps) => {
		const isSource = type === 'source';
		useDebouncedEffect(
			() => {
				if (translatorStore.sourceText && translatorStore.sourceLang !== translatorStore.targetLang) {
					translatorStore.translateText();
				}
			},
			[translatorStore.sourceText, translatorStore.sourceLang, translatorStore.targetLang],
			1500
		);

		return (
			<div className="core-border relative flex flex-1 flex-col rounded-xl">
				<div className="flex-1">
					{loading ? (
						<div className="flex h-full items-center justify-center">
							<Preloader className="size-15" />
						</div>
					) : (
						<Textarea
							className="hide-scrollbar h-full overflow-auto px-2 pt-8 text-sm"
							readOnly={!isSource}
							size="custom"
							value={text}
							variant="custom"
							onChange={onChangeText ? (e) => onChangeText(e.target.value) : undefined}
						/>
					)}
					<TranslatorBoxActions
						disabled={text === ''}
						type={type}
						onClear={onClearTextbox}
						onCopy={() => copyExt(text, `${isSource ? 'Оригинал' : 'Перевод'} скопирован!`)}
					/>
				</div>
				<div className={cn(isSource ? 'pr-4 pl-2' : 'pr-2 pl-4')}>
					<SelectExt
						className="rounded-none border-t border-[var(--border-color)]"
						options={translatorStore.languages}
						value={language}
						variant="mobile"
						visibleDown={false}
						visibleKey={false}
						onChange={(value) => onChangeLanguage(value)}
					/>
				</div>
			</div>
		);
	}
);

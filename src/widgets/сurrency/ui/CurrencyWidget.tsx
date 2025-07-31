import { observer } from 'mobx-react-lite';

import { copyExt } from '@/shared/lib/utils';

import { useCurrency } from '../model';
import { CurrencyControls } from '.';

const CurrencyWidget = () => {
	const { exchangeRate, exchangeResult } = useCurrency();

	return (
		<div className="core-card core-base flex h-full flex-col shadow-[var(--shadow)]">
			<h1 className="core-header">Конвертер валют</h1>
			<div
				className="m-auto flex cursor-copy text-4xl hover:text-[var(--accent-default)]"
				title="Скопировать курс обмена"
				onClick={() => copyExt(exchangeRate, 'Курс обмена скопирован!')}
			>
				{exchangeRate}
			</div>
			<CurrencyControls />
			<div
				className="mx-auto flex h-9 cursor-copy items-end text-[var(--color-disabled)] hover:text-[var(--accent-default)]"
				title="Скопировать результат обмена"
				onClick={() => copyExt(exchangeResult, 'Результат обмена скопирован!')}
			>
				{exchangeResult}
			</div>
		</div>
	);
};

export default observer(CurrencyWidget);

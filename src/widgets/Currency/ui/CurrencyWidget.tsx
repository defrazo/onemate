import { CurrencyControls, CurrencyView } from '.';

const CurrencyWidget = () => {
	return (
		<div className="core-card core-base flex h-full w-full flex-1 flex-col gap-2 shadow-[var(--shadow)]">
			<h1 className="core-header">Конвертер валют</h1>
			<CurrencyView />
			<CurrencyControls />
		</div>
	);
};

export default CurrencyWidget;

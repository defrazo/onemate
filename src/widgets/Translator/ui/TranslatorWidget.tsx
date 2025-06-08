import { forwardRef, useEffect, useMemo, useState } from 'react';

import { IconArrows, IconCopy } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';
import { Button, Select, Textarea } from '@/shared/ui';

type CurrencyData = {
	[key: string]: number | undefined;
};

interface TranslatorWidgetProps {
	className?: string;
}

const TranslatorWidget = forwardRef<HTMLDivElement, TranslatorWidgetProps>((props, ref) => {
	const [firstInitial, setFirstInitial] = useState<boolean>(true);
	const [swapTriggered, setSwapTriggered] = useState<boolean>(false);
	const [lastChange, setLastChange] = useState<number | undefined>();
	const [lastSelect, setLastSelect] = useState<number | undefined>();
	const [currencyValues, setCurrencyValues] = useState<number[]>([1, 1]);
	const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(['', '']);
	// const [currencyView, setCurrencyView] = useState<string>('Пожалуйста, выберите обе валюты');
	const [currencyView, setCurrencyView] = useState<string>('');
	const [currencyData, setCurrencyData] = useState<CurrencyData>({});
	const currencyNames: { [key: string]: string } = {
		AUD: 'Австралийский доллар',
		AZN: 'Азербайджанский манат',
		GBP: 'Фунт стерлингов',
		AMD: 'Армянский драм',
		BYN: 'Белорусский рубль',
		BGN: 'Болгарский лев',
		BRL: 'Бразильский реал',
		HUF: 'Венгерский форинт',
		VND: 'Вьетнамский донг',
		HKD: 'Гонконгский доллар',
		GEL: 'Грузинский лари',
		DKK: 'Датская крона',
		AED: 'Дирхам ОАЭ',
		USD: 'Доллар США',
		EUR: 'Евро',
		EGP: 'Египетский фунт',
		INR: 'Индийская рупия',
		IDR: 'Индонезийская рупия',
		KZT: 'Казахстанский тенге',
		CAD: 'Канадский доллар',
		QAR: 'Катарский риал',
		KGS: 'Кыргызский сом',
		CNY: 'Китайский юань',
		MDL: 'Молдавский лей',
		NZD: 'Новозеландский доллар',
		NOK: 'Норвежская крона',
		PLN: 'Польский злотый',
		RUB: 'Российский рубль',
		RON: 'Румынский лей',
		XDR: 'СДР (специальные права заимствования)',
		SGD: 'Сингапурский доллар',
		TJS: 'Таджикский сомони',
		THB: 'Тайский бат',
		TRY: 'Турецких лир',
		TMT: 'Новый туркменский манат',
		UZS: 'Узбекский сум',
		UAH: 'Украинская гривна',
		CZK: 'Чешских крон',
		SEK: 'Шведская крона',
		CHF: 'Швейцарский франк',
		RSD: 'Сербский динар',
		ZAR: 'Южноафриканский рэнд',
		KRW: 'Вон Республики Корея',
		JPY: 'Японская иена',
	};

	const mergedCurrency = useMemo(() => {
		return Object.keys(currencyData).reduce(
			(acc, key) => {
				acc[key] = {
					name: currencyNames[key as keyof typeof currencyNames],
					value: currencyData[key],
				};

				return acc;
			},
			{} as { [key: string]: { name: string; value: number | undefined } }
		);
	}, [currencyData]);

	const exchangeRates: number[] = [
		mergedCurrency[selectedCurrencies[0]]?.value || 1,
		mergedCurrency[selectedCurrencies[1]]?.value || 1,
	];

	const handleCurrencyValue = (value: number, index: number): void => {
		setCurrencyValues((prevValues) => {
			const newValues = [...prevValues];
			newValues[index] = value;

			if (selectedCurrencies[0] === 'Российский рубль') {
				if (index === 0) {
					newValues[1] = Number((value / exchangeRates[1]).toFixed(2));
				} else {
					newValues[0] = Number((value * exchangeRates[1]).toFixed(2));
				}
			} else if (selectedCurrencies[1] === 'Российский рубль') {
				if (index === 0) {
					newValues[1] = Number((value * exchangeRates[0]).toFixed(2));
				} else {
					newValues[0] = Number((value / exchangeRates[0]).toFixed(2));
				}
			} else {
				if (index === 0) {
					newValues[1] = Number(((value * exchangeRates[1]) / exchangeRates[0]).toFixed(2));
				} else {
					newValues[0] = Number(((value * exchangeRates[0]) / exchangeRates[1]).toFixed(2));
				}
			}
			setLastChange(index);

			return newValues;
		});
	};

	const selectCurrencies = (selectedCurrency: string, index: 0 | 1): void => {
		setSelectedCurrencies((prevValues) => {
			const newValues = [...prevValues];
			const otherIndex = index === 0 ? 1 : 0;

			if (prevValues[otherIndex] === selectedCurrency) {
				newValues[otherIndex] = '';
			}

			newValues[index] = selectedCurrency;
			setLastSelect(index === 0 ? 1 : 0);

			return newValues;
		});
	};

	const currencyViewDetails = (): void => {
		const basicCurrencyViewValue = 'Необходимо выбрать обе валюты';
		const [currencyKey1, currencyKey2] = selectedCurrencies;
		const currencyName1 = mergedCurrency[currencyKey1]?.name || '';
		const currencyName2 = mergedCurrency[currencyKey2]?.name || '';
		const convertedCurrencies = ((1 / exchangeRates[0]) * exchangeRates[1]).toFixed(2);
		const newCurrencyViewValue =
			currencyKey1 && currencyKey2
				? `1 ${currencyName1} равно \n${convertedCurrencies} ${currencyName2}`
				: basicCurrencyViewValue;
		setCurrencyView(newCurrencyViewValue);
	};

	const swapCurrencies = (): void => {
		setSelectedCurrencies((prevCurrency) => [prevCurrency[1], prevCurrency[0]]);
		setSwapTriggered(true);
	};

	const fetchCurrencyData = async (): Promise<void> => {
		try {
			// const response = await fetch('https://www.cbr-xml-daily.ru/latest.js');
			// const { rates } = await response.json();
			// rates.RUB = 1;
			// localStorage.setItem('currencyData', JSON.stringify(rates));
			// localStorage.setItem('lastUpdate', new Date().toISOString());
			// setCurrencyData(rates);
		} catch (error) {
			// console.error('Ошибка при получении данных о курсе валют:', error);
		}
	};

	const restoreCurrencyData = (): void => {
		const storedCurrencyData = localStorage.getItem('currencyData');
		const storedLastUpdate = localStorage.getItem('lastUpdate');

		if (storedCurrencyData && storedLastUpdate) {
			const parsedCurrencyData = JSON.parse(storedCurrencyData);
			setCurrencyData(parsedCurrencyData);

			const lastUpdate = new Date(storedLastUpdate);
			const currentDate = new Date();

			if (currentDate.getTime() - lastUpdate.getTime() < 24 * 60 * 60 * 1000) {
				return;
			}
		}
		fetchCurrencyData();
	};

	// useEffect(() => {
	//     if (firstInitial && selectedCurrencies[0] && selectedCurrencies[1]) {
	//         handleCurrencyValue(currencyValues[0], 0);
	//         setFirstInitial(false);
	//     }
	// }, [selectedCurrencies]);

	useEffect(() => {
		if (swapTriggered) {
			handleCurrencyValue(currencyValues[0], 0);
			setSwapTriggered(false);
		}
	}, [swapTriggered]);

	useEffect(() => {
		if (lastChange && selectedCurrencies[0] && selectedCurrencies[1]) {
			handleCurrencyValue(currencyValues[lastChange], lastChange);
		}
	}, [lastChange]);

	// useEffect(() => {
	//     console.log('lastSelect is changed', lastSelect)
	//     // const newSelect = lastSelect === 0 ? 1 : 0;
	//     if (lastSelect && selectedCurrencies[0] && selectedCurrencies[1]) {
	//         handleCurrencyValue(currencyValues[lastSelect], lastSelect);
	//     }
	// }, [lastSelect]);

	// useEffect(() => {
	//     if (selectedCurrencies[0] && selectedCurrencies[1]) {
	//         currencyViewDetails();
	//         if (lastSelect !== undefined) {
	//             handleCurrencyValue(currencyValues[lastSelect], lastSelect);
	//         }
	//     }
	// }, [selectedCurrencies]);

	useEffect(() => {
		if (selectedCurrencies[0] && selectedCurrencies[1]) {
			currencyViewDetails();

			if (firstInitial) {
				handleCurrencyValue(currencyValues[0], 0);
				setFirstInitial(false);
			} else if (lastSelect !== undefined) {
				handleCurrencyValue(currencyValues[lastSelect], lastSelect);
			}
		}
	}, [selectedCurrencies, firstInitial, lastSelect]);

	useEffect(() => {
		restoreCurrencyData();
	}, []);

	return (
		<div
			ref={ref}
			{...props}
			className={cn(
				'core-card core-base flex w-full flex-1 flex-col gap-2 shadow-[var(--shadow)]',
				props.className
			)}
		>
			<span className="core-header">Переводчик</span>
			<div className="flex h-full flex-col gap-2">
				<div className="relative flex h-full w-full gap-2">
					<div className="core-border relative flex w-full flex-col rounded-xl p-1">
						<Textarea
							className="pointer-events-none grow cursor-default"
							placeholder="Введите текст"
							readOnly
							value={currencyView}
							variant="custom"
						/>
						<Select
							className=""
							options={Object.keys(mergedCurrency).map((key) => {
								const { name } = mergedCurrency[key];
								return {
									value: key,
									label: key,
									disabled: false,
								};
							})}
							placeholder="Выберите язык"
							value={selectedCurrencies[0]}
							onChange={(e) => selectCurrencies(e.target.value, 0)}
						/>
						<Button
							centerIcon={<IconCopy className="size-5" />}
							className={cn(
								'absolute top-0 right-0 bg-transparent p-2 opacity-20 transition hover:bg-transparent hover:opacity-100 active:bg-transparent'
							)}
							size="custom"
							title="Скопировать в буфер"
							variant="mobile"
						/>
					</div>
					<Button
						centerIcon={<IconArrows className="size-5" />}
						className="core-base absolute bottom-12 left-1/2 z-20 size-10 -translate-x-1/2 rotate-90"
						variant="custom"
						onClick={swapCurrencies}
					/>
					<div className="core-border relative flex w-full flex-col rounded-xl p-1">
						<Textarea
							className="pointer-events-none grow cursor-default"
							placeholder="Перевод"
							readOnly
							value={currencyView}
							variant="custom"
						/>
						<Select
							className=""
							options={Object.keys(mergedCurrency).map((key) => {
								const { name } = mergedCurrency[key];
								return {
									value: key,
									label: key,
									disabled: false,
								};
							})}
							placeholder="Выберите язык"
							value={selectedCurrencies[1]}
							onChange={(e) => selectCurrencies(e.target.value, 1)}
						/>
						<Button
							centerIcon={<IconCopy className="size-5" />}
							className={cn(
								'absolute top-0 right-0 bg-transparent p-2 opacity-20 transition hover:bg-transparent hover:opacity-100 active:bg-transparent'
							)}
							size="custom"
							title="Скопировать в буфер"
							variant="mobile"
						/>
					</div>
				</div>
			</div>
		</div>
	);
});

export default TranslatorWidget;

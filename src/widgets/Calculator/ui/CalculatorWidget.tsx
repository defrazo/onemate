import { forwardRef, useState } from 'react';

import { cn } from '@/shared/lib/utils';
import { Button, Input, Textarea } from '@/shared/ui';

interface CalculatorWidgetProps {
	className?: string;
}

const CalculatorWidget = forwardRef<HTMLDivElement, CalculatorWidgetProps>((props, ref) => {
	const [displayValue, setDisplayValue] = useState<string>('0');
	const [logVisible, setLogVisible] = useState<boolean>(true);
	const [resultValue, setResultValue] = useState<{ expression: string; result: string | undefined }[]>([]);
	/* prettier-ignore */
	const buttons = [
        'ON/C', 'OFF', '√', '⌫',
        '7', '8', '9', '÷',
        '4', '5', '6', '×',
        '1', '2', '3', '−',
        '±', '0', '.', '+',
        '(', ')', '=',
    ];

	const handleButtonClick = (value: string): void => {
		switch (value) {
			case 'ON/C':
				setDisplayValue('0');
				setResultValue([]);
				break;
			case 'OFF':
				setDisplayValue('');
				setResultValue([]);
				break;
			case '⌫':
				return displayValue === '0'
					? setDisplayValue('0')
					: setDisplayValue((prevDisplayValue) =>
							displayValue.length > 1 ? prevDisplayValue.slice(0, -1) : '0'
						);
			case '(':
				return setDisplayValue((prev) => (prev === '0' ? '(' : /[+\-*/(]$/.test(prev) ? prev + '(' : prev));
			case ')':
				return setDisplayValue((prev) =>
					prev !== '0' && prev.includes('(') && /[+\-*/(]?\d$/.test(prev) ? prev + ')' : prev
				);
			case '±': {
				const arr = displayValue.match(/(\d+|[^\d])/g);

				if (arr) {
					const arr2 = arr.slice();
					const lastIndex = arr.length - 1;
					const secondLastIndex = arr.length - 2;

					if (!isNaN(Number(arr[lastIndex]))) {
						if (arr[secondLastIndex] === '-') arr2[secondLastIndex] = '';
						else arr2[lastIndex] = '-' + arr[lastIndex];
					}

					return setDisplayValue(arr2.join(''));
				}

				break;
			}
			case 'Журнал':
				setLogVisible((prevVisibility) => !prevVisibility);
				break;
			default:
				setDisplayValue(calculate(displayValue, value));
		}
	};

	const handleNumber = (display: string, value: string): string => {
		return display === '0' ? value : display + value;
	};

	const calculate = (displayValue: string, value: string): string => {
		const lastCharIsNumber = /[0-9]$/.test(displayValue);

		switch (value) {
			case '÷':
			case '×':
			case '−':
			case '+':
				return displayValue !== '0'
					? lastCharIsNumber
						? displayValue + value
						: displayValue.slice(0, -1) + value
					: '0';
			case '√':
				return displayValue !== '0' ? handleResult('√' + displayValue) : displayValue;
			case '.':
				return lastCharIsNumber
					? !/(\.\d*)$/.test(displayValue)
						? displayValue + '.'
						: displayValue
					: displayValue;
			case '=':
				return handleResult(displayValue);
			default:
				return !isNaN(Number(value)) ? handleNumber(displayValue, value) : displayValue;
		}
	};

	function formatNumber(numberString: string): string {
		const number = parseFloat(numberString);
		const roundedNumber = number.toFixed(2);

		if (Number.isInteger(number)) return number.toString();
		else return roundedNumber;
	}

	// const handleResult = (displayValue: string): string => {
	//     let expression: string = displayValue
	//         .replace(/×/g, '*')
	//         .replace(/÷/g, '/')
	//         .replace(/−/g, '-')
	//         .replace(/--/g, '+');

	//     if (!/[0-9]$/.test(expression)) expression = expression.slice(0, -1);

	//     let result: string;

	//     try {
	//         if (expression.includes('√')) {
	//             const root: number = parseFloat(expression.replace('√', ''));
	//             result = formatNumber(Math.sqrt(root).toFixed(2));
	//         } else {
	//             result = formatNumber(eval(expression).toFixed(2).toString());
	//         }
	//         setResultValue((prevResultValue) => [...prevResultValue, { expression, result }]);
	//     } catch (error) {
	//         result = 'Error';
	//     }

	//     setDisplayValue(result);

	//     return result;
	// };

	const handleResult = (displayValue: string): string => {
		let expression: string = displayValue
			.replace(/×/g, '*')
			.replace(/÷/g, '/')
			.replace(/−/g, '-')
			.replace(/--/g, '+');

		if (!/[0-9)]$/.test(expression)) expression = expression.slice(0, -1);

		let result: string;

		try {
			if (expression.includes('√')) {
				const rootExpression = expression.replace(/√/g, 'Math.sqrt');
				result = formatNumber(new Function(`return ${rootExpression}`)().toFixed(2));
			} else {
				// Проверяем на валидность, чтобы не было букв и запрещённых символов
				if (!/^[-+*/().0-9\s]+$/.test(expression)) throw new Error('Invalid expression');

				result = formatNumber(new Function(`return ${expression}`)().toFixed(2));
			}

			setResultValue((prevResultValue) => [...prevResultValue, { expression, result }]);
		} catch (error) {
			result = 'Error';
		}

		setDisplayValue(result);
		return result;
	};

	const renderResultValue = (resultValue: { expression: string; result: string | undefined }[]): string => {
		return resultValue
			.slice()
			.reverse()
			.map((item) => `${item.expression} = ${item.result}`)
			.join('\n');
	};

	return (
		<div
			ref={ref}
			{...props}
			className={cn(
				'core-base core-card flex w-full flex-2 flex-col gap-2 shadow-[var(--shadow-card)]',
				props.className
			)}
		>
			{/* <div className="core-base core-card flex h-full flex-1 flex-col gap-2 shadow-[var(--shadow-card)]"> */}
			<span className="core-header">Калькулятор</span>
			<Input
				className="pointer-events-none cursor-default px-2 text-right text-2xl"
				readOnly
				type="text"
				value={displayValue}
				variant="ghost"
			/>
			{/* <div className="my-2 w-full"> */}
			<div className="grid grid-cols-4 gap-2">
				{buttons.slice(0, buttons.length - 3).map((value) => (
					<Button key={value} className="core-elements" size="sm" onClick={() => handleButtonClick(value)}>
						{value}
					</Button>
				))}
				<div className="col-span-4 grid grid-cols-4 gap-2">
					{buttons.slice(-3, -1).map((value) => (
						<Button
							key={value}
							className="core-elements col-span-1"
							size="sm"
							onClick={() => handleButtonClick(value)}
						>
							{value}
						</Button>
					))}
					{buttons.slice(-1).map((value) => (
						<Button
							key={value}
							className="core-elements col-span-2"
							size="sm"
							onClick={() => handleButtonClick(value)}
						>
							{value}
						</Button>
					))}
				</div>
			</div>
			{/* </div> */}
			<Textarea
				className="pointer-events-none grow cursor-default text-right"
				placeholder="Журнала еще нет"
				readOnly
				value={renderResultValue(resultValue)}
				variant="ghost"
			/>
		</div>
	);
});

export default CalculatorWidget;

import React, { useState } from 'react';
import '../../styles/App.css';
import MyButton from '../UI/button/MyButton';
import MyInput from '../UI/input/MyInput';
import MyTextarea from '../UI/textarea/MyTextarea';
import css from './Calculator.module.css';
import styled from 'styled-components';

const StyledComponents = {
    Container: styled.div`
        background: ${({ theme }) => theme.backgroundColor};
        color: ${({ theme }) => theme.textColor};
    `,
    Header: styled.div`
        color: ${({ theme }) => theme.titleTextColor};
    `,
};

const Calculator = () => {
    const [display, setDisplay] = useState('0');
    const [isShown, setIsShown] = useState(false);
    const [historyVisible, setHistoryVisible] = useState(false);
    const [results, setResults] = useState([]);

    const handleBtnClick = (value) => {
        switch (value) {
            case 'on':
                setDisplay('0');
                setResults([]);
                setIsShown(false);
                break;
            case 'off':
                setDisplay('');
                break;
            case '+/-':
                setDisplay((prevDisplay) =>
                    prevDisplay !== '0' && !isShown
                        ? prevDisplay.startsWith('-')
                            ? prevDisplay.slice(1)
                            : '-' + prevDisplay
                        : '0'
                );
                break;
            case '(':
                setDisplay((prevDisplay) =>
                    prevDisplay === '0'
                        ? '('
                        : prevDisplay[prevDisplay.length - 1] !== '(' && isNaN(Number(prevDisplay[prevDisplay.length - 1]))
                            ? prevDisplay + '('
                            : prevDisplay
                );
                break;
            case ')':
                setDisplay((prevDisplay) =>
                    prevDisplay === '0'
                        ? prevDisplay
                        : prevDisplay[prevDisplay.length - 1] !== ')' && !isNaN(Number(prevDisplay[prevDisplay.length - 1])) && prevDisplay.includes('(') && /[+\-*/]/.test(prevDisplay)
                            ? prevDisplay + ')'
                            : prevDisplay
                );
                break;
            case '<':
                setDisplay((prevDisplay) => prevDisplay.slice(0, -1));
                break;
            case '/':
                setDisplay((prevDisplay) =>
                    !isNaN(Number(prevDisplay[prevDisplay.length - 1]))
                        ? prevDisplay + '/'
                        : prevDisplay.slice(0, -1) + '/'
                );
                break;
            case '*':
                setDisplay((prevDisplay) =>
                    !isNaN(Number(prevDisplay[prevDisplay.length - 1]))
                        ? prevDisplay + '*'
                        : prevDisplay.slice(0, -1) + '*'
                );
                break;
            case '-':
                setDisplay((prevDisplay) =>
                    !isNaN(Number(prevDisplay[prevDisplay.length - 1]))
                        ? prevDisplay + '-'
                        : prevDisplay.slice(0, -1) + '-'
                );
                break;
            case '+':
                setDisplay((prevDisplay) =>
                    !isNaN(Number(prevDisplay[prevDisplay.length - 1]))
                        ? prevDisplay + '+'
                        : prevDisplay.slice(0, -1) + '+'
                );
                break;
            case '√':
                setDisplay((prevDisplay) =>
                    prevDisplay === '0' && !prevDisplay.includes('√')
                        ? '√'
                        : prevDisplay
                );
                break;
            default:
                setDisplay((prevDisplay) =>
                    !isShown
                        ? prevDisplay === '0'
                            ? value
                            : prevDisplay + value
                        : prevDisplay === '0'
                            ? prevDisplay + value : value
                );
                setIsShown(false);
                break;
        }
    };

    function formatNumber(numberString) {
        const number = parseFloat(numberString);
        const roundedNumber = number.toFixed(2);
        if (Number.isInteger(number)) {
            return number.toString();
        } else {
            return roundedNumber;
        }
    };

    const handleBtnResult = () => {
        const expression = display;

        if (expression.includes('(') && !expression.includes(')')) {
            alert('Необходимо закрыть скобки');
        } else {
            let result;

            try {
                if (display.includes('%')) {
                    const parts = display.split('%');
                    const baseValue = parseFloat(parts[0]);
                    const percentage = parseFloat(parts[1]);

                    if (!isNaN(baseValue) && !isNaN(percentage)) {
                        result = formatNumber(((baseValue / 100) * percentage).toFixed(2).toString());
                        setDisplay(result);
                    }
                } else if (display.includes('√')) {
                    const root = display.replace('√', '');

                    result = formatNumber(Math.sqrt(root).toFixed(2));
                    setDisplay(result);
                } else {
                    result = formatNumber(eval(display).toFixed(2).toString());
                    setDisplay(result);
                }
            } catch (error) {
                setDisplay('Error');
            }
            setResults((prevResults) => [...prevResults, { expression, result }]);
            setIsShown(true);
        }
    };

    const renderResults = () => {
        return results
            .slice()
            .reverse()
            .map((item, index) => `${item.expression} = ${item.result}`)
            .join('\n');
    };

    const openHistory = () => {
        setHistoryVisible((prevVisibility) => !prevVisibility);
    };

    const renderButton = (label, clickHandler, index) => (
        <MyButton
            key={index}
            addStyle={css['calc-container__btns__btn']}
            onClick={clickHandler}
        >
            {label}
        </MyButton>
    );

    return (
        <StyledComponents.Container className={css['calc-container']}>
            <StyledComponents.Header className="title">
                Калькулятор
            </StyledComponents.Header>
            <MyInput
                addStyle={css['calc-container__display']}
                type="text"
                value={display}
                readOnly
            />
            <div className={css['calc-container__btns']}>
                {renderButton('ON/C', () => handleBtnClick('on'))}
                {renderButton('±', () => handleBtnClick('+/-'))}
                {renderButton('(', () => handleBtnClick('('))}
                {renderButton(')', () => handleBtnClick(')'))}
                {renderButton('⌫', () => handleBtnClick('<'))}
                {renderButton('OFF', () => handleBtnClick('off'))}
                {['7', '8', '9', '/'].map((label, index) => renderButton(label, () => handleBtnClick(label), index))}
                {['%', '4', '5', '6', '*'].map((label, index) => renderButton(label, () => handleBtnClick(label), index))}
                {['√', '1', '2', '3', '-'].map((label, index) => renderButton(label, () => handleBtnClick(label), index))}
                {renderButton('Журнал', openHistory)}
                {['0', '.', '=', '+'].map((label, index) => renderButton(label, label === '=' ? handleBtnResult : () => handleBtnClick(label), index))}
            </div>
            <div className={`${historyVisible ? '' : css['calc-container__log--visible']}`}>
                <MyTextarea
                    addStyle={css['calc-container__log__textarea']}
                    placeholder="Пока здесь ничего нет..."
                    value={renderResults(results)}
                    rows={6}
                    readOnly
                />
            </div>
        </StyledComponents.Container>
    );
};

export default Calculator;
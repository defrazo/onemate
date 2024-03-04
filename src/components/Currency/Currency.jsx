import React, { useEffect, useState } from 'react';
import MyTextarea from '../UI/textarea/MyTextarea';
import MySelect from '../UI/select/MySelect';
import MyInput from '../UI/input/MyInput';
import MyButton from '../UI/button/MyButton';
import css from './Currency.module.css';
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

const Currency = () => {
    const [selectedCur1, setSelectedCur1] = useState('');
    const [selectedCur2, setSelectedCur2] = useState('');
    const [currency1Value, setCurrency1Value] = useState('1');
    const [currency2Value, setCurrency2Value] = useState('1');
    const [firstClickedCurr, setFirstClickedCurr] = useState('');
    const [currencyData, setCurrencyData] = useState([]);
    const [curOne, setCurOne] = useState(null);
    const [textAreaValue, setTextAreaValue] = useState('Пожалуйста, выберите обе валюты');
    const exchangeRateCur1 = currencyData[getCurrCodeByName(selectedCur1)]?.Value;
    const exchangeRateCur2 = currencyData[getCurrCodeByName(selectedCur2)]?.Value;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
                const data = await response.json();

                localStorage.setItem('currencyData', JSON.stringify(data.Valute));
                localStorage.setItem('lastUpdate', new Date().toISOString());
                // console.log('Выполнен запрос')
                setCurrencyData(data.Valute);
            } catch (error) {
                console.error('Ошибка при получении данных о курсе валют:', error);
            }
        };

        const storedCurrencyData = localStorage.getItem('currencyData');
        const storedLastUpdate = localStorage.getItem('lastUpdate');

        if (storedCurrencyData && storedLastUpdate) {
            const parsedCurrencyData = JSON.parse(storedCurrencyData);

            setCurrencyData(parsedCurrencyData);

            const lastUpdate = new Date(storedLastUpdate);
            const currentDate = new Date();
            if (currentDate - lastUpdate < 24 * 60 * 60 * 1000) {
                // console.log('Данные актуальны')
                return;
            }
            // console.log('Данные обновлены')
        }

        fetchData();
    }, []);

    useEffect(() => {
        const basicValue = 'Необходимо выбрать обе валюты';
        const value = `1 ${selectedCur1} равно \n${curOne} ${selectedCur2}`;

        setTextAreaValue(selectedCur1 && selectedCur2 ? value : basicValue);
    }, [selectedCur1, selectedCur2, curOne]);

    useEffect(() => {
        setCurOne((1 * exchangeRateCur1 / exchangeRateCur2).toFixed(2));
    }, [selectedCur1, selectedCur2, exchangeRateCur1, exchangeRateCur2]);

    useEffect(() => {
        if (firstClickedCurr === 'curr1' && selectedCur1 === selectedCur2) {
            setSelectedCur2('');
        } else if (firstClickedCurr === 'curr2' && selectedCur2 === selectedCur1) {
            setSelectedCur1('');
        }
    }, [selectedCur1, selectedCur2, firstClickedCurr]);

    function getCurrCodeByName(name) {
        const currencyCodes = {
            "Австралийский доллар": "AUD",
            "Азербайджанский манат": "AZN",
            "Фунт стерлингов Соединенного королевства": "GBP",
            "Армянских драмов": "AMD",
            "Белорусский рубль": "BYN",
            "Болгарский лев": "BGN",
            "Бразильский реал": "BRL",
            "Венгерских форинтов": "HUF",
            "Вьетнамских донгов": "VND",
            "Гонконгский доллар": "HKD",
            "Грузинский лари": "GEL",
            "Датская крона": "DKK",
            "Дирхам ОАЭ": "AED",
            "Доллар США": "USD",
            "Евро": "EUR",
            "Египетских фунтов": "EGP",
            "Индийских рупий": "INR",
            "Индонезийских рупий": "IDR",
            "Казахстанских тенге": "KZT",
            "Канадский доллар": "CAD",
            "Катарский риал": "QAR",
            "Киргизских сомов": "KGS",
            "Китайский юань": "CNY",
            "Молдавских леев": "MDL",
            "Новозеландский доллар": "NZD",
            "Норвежских крон": "NOK",
            "Польский злотый": "PLN",
            "Румынский лей": "RON",
            "СДР (специальные права заимствования)": "XDR",
            "Сингапурский доллар": "SGD",
            "Таджикских сомони": "TJS",
            "Таиландских батов": "THB",
            "Турецких лир": "TRY",
            "Новый туркменский манат": "TMT",
            "Узбекских сумов": "UZS",
            "Украинских гривен": "UAH",
            "Чешских крон": "CZK",
            "Шведских крон": "SEK",
            "Швейцарский франк": "CHF",
            "Сербских динаров": "RSD",
            "Южноафриканских рэндов": "ZAR",
            "Вон Республики Корея": "KRW",
            "Японских иен": "JPY",
        };

        return currencyCodes[name] || name;
    };

    const set1Value = (value) => {
        const amountInRub = ((value * exchangeRateCur1) / exchangeRateCur2).toFixed(2);

        setCurrency2Value(parseFloat(amountInRub));
        setCurrency1Value(parseFloat(value));
    };

    const set2Value = (value) => {
        const amountInRub = ((value * exchangeRateCur2) / exchangeRateCur1).toFixed(2);

        setCurrency1Value(parseFloat(amountInRub));
        setCurrency2Value(parseFloat(value));
    };

    const changing = () => {
        setSelectedCur1(selectedCur2);
        setSelectedCur2(selectedCur1);
        setCurrency1Value(currency2Value);
        setCurrency2Value(currency1Value);
    };

    return (
        <StyledComponents.Container className={css['currency-container']}>
            <StyledComponents.Header className="title">
                Курсы валют
            </StyledComponents.Header>
            <MyTextarea
                addStyle={css['currency-container__textarea']}
                value={textAreaValue}
                readOnly
            />
            <div className={css['currency-container__converter']}>
                <div className={css['currency-container__converter__first-col']}>
                    <MyInput
                        addStyle={css['currency-container__converter__input']}
                        type="number"
                        value={currency1Value}
                        onChange={(event) => set1Value(event.target.value)}
                    />
                    <MyInput
                        addStyle={css['currency-container__converter__input']}
                        type="number"
                        value={currency2Value}
                        onChange={(event) => set2Value(event.target.value)}
                    />
                </div>
                <div className={css['currency-container__converter__second-col']}>
                    <MySelect
                        id="curr1"
                        addStyle={css['currency-container__converter__select']}
                        defaultValue="Выберите валюту"
                        value={selectedCur1}
                        onChange={(value) => { setSelectedCur1(value); setFirstClickedCurr('curr1') }}
                        options={Object.keys(currencyData).map((key) => ({
                            key,
                            value: currencyData[key].Name,
                            name: currencyData[key].Name,
                        }))}
                    />
                    <MySelect
                        id="curr2"
                        addStyle={css['currency-container__converter__select']}
                        defaultValue="Выберите валюту"
                        value={selectedCur2}
                        onChange={(value) => { setSelectedCur2(value); setFirstClickedCurr('curr2') }}
                        options={Object.keys(currencyData).map((key) => ({
                            key,
                            value: currencyData[key].Name,
                            name: currencyData[key].Name,
                        }))}
                    />
                </div>
                <div className={css['currency-container__converter__third-col']}>
                    <MyButton
                        addStyle={css['currency-container__converter__swap-btn']}
                        onClick={changing}
                    >
                        &#128472;
                    </MyButton>
                </div>
            </div>
        </StyledComponents.Container>
    );
};

export default Currency;
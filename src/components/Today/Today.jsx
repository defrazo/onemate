import React, { useEffect, useState } from 'react';
import Preloader from '../UI/preloader/Preloader';
import css from './Today.module.css';
import styled from 'styled-components';

const StyledComponents = {
    Container: styled.div`
        color: ${({ theme }) => theme.titleTextColor};
    `,
};

const Today = () => {
    const [day, setDay] = useState(null);
    const [month, setMonth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const weekDays = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
        const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
        const currentDay = new Date().getDay();
        const currentMonth = new Date().getMonth();

        setDay(weekDays[currentDay]);
        setMonth(months[currentMonth]);

        const updateDate = () => {
            const currentDay = weekDays[new Date().getDay()];
            const currentMonth = months[new Date().getMonth()];

            setDay(currentDay)
            setMonth(currentMonth);
            setLoading(false);
        }

        updateDate();
    }, []);

    return (
        <StyledComponents.Container className={css['today-container']}>
            {loading ? (
                <Preloader />
            ) : (
                <h1>{day}, {new Date().getDate()} {month}</h1>
            )}
        </StyledComponents.Container>
    );
};

export default Today;
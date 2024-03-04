import React, { useState } from 'react';
import ReactCalendar from 'react-calendar';
import './Calendar.css';
import css from './Calendar.module.css';
import styled from 'styled-components';

const StyledComponents = {
    Container: styled.div`
        background: ${({ theme }) => theme.backgroundColor};
        color: ${({ theme }) => theme.textColor};
    `,
    Header: styled.div`
        color: ${({ theme }) => theme.titleTextColor};
    `,
    Calendar: styled(ReactCalendar)`
        background: ${({ theme }) => theme.backgroundColor};
        color: ${({ theme }) => theme.textColor};
        
        .react-calendar__viewContainer,
        .react-calendar__navigation {
            background-color: ${({ theme }) => theme.elementsBackgroundColor};
        }
            
        .react-calendar__month-view__weekdays__weekday{
            color: ${({ theme }) => theme.textColor};
        }
        
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus
        .react-calendar__tile--now,
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus,
        .react-calendar__tile--now:enabled:hover,
        .react-calendar__tile--now:enabled:focus,
        .react-calendar__tile--active,
        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
            background-color: ${({ theme }) => theme.elementsHoverBackgroundColor};
        }
    `,
};

const Calendar = () => {
    const [date, setDate] = useState(new Date());

    const handleDateChange = (selectedDate) => {
        setDate(selectedDate);
    };

    return (
        <StyledComponents.Container className={css['calendar-container']}>
            <StyledComponents.Header className="title">
                Календарь
            </StyledComponents.Header>
            <StyledComponents.Calendar
                onChange={handleDateChange}
                value={date}
            />
        </StyledComponents.Container>
    );
};

export default Calendar;
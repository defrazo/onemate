import React from 'react';
import css from './Main.module.css';
import Calculator from '../../components/Calculator/Calculator';
import Currency from '../../components/Currency/Currency';
import Calendar from '../../components/Calendar/Calendar';
import Clock from '../../components/Clock/Clock';
import Today from '../../components/Today/Today';
import Notes from '../../components/Notes/Notes';
import styled from 'styled-components';

const Container = styled.div`
    background: ${({ theme }) => theme.defaultBackgroundColor};
    color: ${({ theme }) => theme.textColor};
`;

function Main() {

    return (
        <Container className={css['main-container']}>
            <div className={css['main-container__first-col']}>
                <Calculator />
                <Currency />
            </div>
            <div className={css['main-container__second-col']}>
                <Calendar />
                <Clock />
                <Today />
            </div>
            <div className={css['main-container__third-col']}>
                <Notes />
            </div>
        </Container>
    );
};

export default Main;
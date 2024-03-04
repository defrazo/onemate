import React, { useState } from 'react';
import { registration } from '../../../actions/user';
import MyInput from '../input/MyInput';
import MyButton from '../button/MyButton';
import css from './Authorization.module.css';
import styled from 'styled-components';

const StyledComponents = {
    Container: styled.div`
        background: ${({ theme }) => theme.backgroundColor};
        color: ${({ theme }) => theme.textColor};
    `,
    Header: styled.div`
        color: ${({ theme }) => theme.titleTextColor};
    `,
    Span: styled.span`
        color: ${({ theme }) => theme.titleTextColor};
    `
};

const Registration = ({ setIsOpen, navigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleCloseButtonClick = () => {
        setIsOpen(false);
        navigate('/');
    };

    return (
        <StyledComponents.Container className={css['authorization-container']}>
            <StyledComponents.Span
                className={css['authorization-container__exit-btn']}
                title="Закрыть окно"
                onClick={handleCloseButtonClick}
            >
                ✖
            </StyledComponents.Span>
            <StyledComponents.Header className={css['authorization-container__header']}>
                Регистрация
            </StyledComponents.Header>
            <MyInput
                value={email}
                addStyle={css['authorization-container__input']}
                type="text"
                placeholder="E-mail"
                onChange={(event) => setEmail(event.target.value)}
            />
            <MyInput
                value={password}
                addStyle={css['authorization-container__input']}
                type="password"
                placeholder="Пароль"
                onChange={(event) => setPassword(event.target.value)}
            />
            <MyButton
                addStyle={css['authorization-container__btn']}
                onClick={() => registration(email, password)}
            >
                Зарегистрироваться
            </MyButton>
        </StyledComponents.Container>
    );
};

export default Registration;
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../../actions/user';
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

const Login = ({ setIsOpen, navigate }) => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEnterKeyPress = (event) => {
        if (event.key === 'Enter') {
            if (email && password) {
                dispatch(login(email, password))
            }
        }
    };

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
                Авторизация
            </StyledComponents.Header>
            <MyInput
                value={email}
                addStyle={css['authorization-container__input']}
                type="text"
                placeholder="E-mail"
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={handleEnterKeyPress}
            />
            <MyInput
                value={password}
                addStyle={css['authorization-container__input']}
                type="password"
                placeholder="Пароль"
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={handleEnterKeyPress}
            />
            <MyButton
                addStyle={css['authorization-container__btn']}
                onClick={() => dispatch(login(email, password))}
            >
                Войти
            </MyButton>
        </StyledComponents.Container>
    );
};

export default Login;
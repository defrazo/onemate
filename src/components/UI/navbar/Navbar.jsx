import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../reducers/userReducer';
import css from './Navbar.module.css';
import Logo from '../../../assets/img/logo.ico';
import MyButton from '../button/MyButton';
import styled from 'styled-components';

const StyledComponents = {
    Container: styled.div`
        border-color: ${({ theme }) => theme.borderColor};
    `,
};

const Navbar = () => {
    const isAuth = useSelector(state => state.user.isAuth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return (
        <StyledComponents.Container className={css['navbar-container']}>
            <div className={css['navbar-container__left-side']}>
                <img src={Logo} alt="Логотип" className={css['navbar-container__left-side__logo']} />
                <div className={css['navbar-container__left-side__header']}>
                    <h2>ORGANIZER</h2>
                </div>
            </div>
            <div className={css['navbar-container__right-side']}>
                {!isAuth ? (
                    <>
                        <MyButton addStyle={css['navbar-container__btn']} onClick={() => navigate("/login")}>
                            Войти
                        </MyButton>
                        <MyButton addStyle={css['navbar-container__btn']} onClick={() => navigate("/registration")}>
                            Зарегистрироваться
                        </MyButton>
                    </>
                ) : (
                    <>
                        <MyButton addStyle={css['navbar-container__btn']} onClick={() => navigate("/main")}>
                            Рабочий стол
                        </MyButton>
                        <MyButton addStyle={css['navbar-container__btn']} onClick={() => navigate("/todo")}>
                            Список дел
                        </MyButton>
                        <MyButton addStyle={css['navbar-container__btn']} onClick={() => dispatch(logout())}>
                            Выход
                        </MyButton>
                    </>
                )}
            </div>
        </StyledComponents.Container>
    );
};

export default Navbar;
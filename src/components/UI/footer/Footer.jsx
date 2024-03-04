import React from 'react';
import ThemeToggle from '../themes/ThemesSwitcher';
import css from './Footer.module.css';
import styled from 'styled-components';

const StyledComponents = {
    Container: styled.div`
        border-color: ${({ theme }) => theme.borderColor};
    `,
};

const Footer = ({ toggleTheme }) => {

    return (
        <StyledComponents.Container className={css['footer-container']}>
            <h2>for good people</h2>
            <ThemeToggle toggleTheme={toggleTheme} />
        </StyledComponents.Container>
    );
};

export default Footer;
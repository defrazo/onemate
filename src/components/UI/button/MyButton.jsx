import React from 'react';
import css from './MyButton.module.css';
import styled from 'styled-components';

const StyledButton = styled.button`
    background-color: ${({ theme }) => theme.elementsBackgroundColor};
    color: ${({ theme }) => theme.textColor};
    &:hover {
        background-color: ${({ theme }) => theme.elementsHoverBackgroundColor};
    }
`;

const MyButton = ({ children, addStyle, ...props }) => {
    return (
        <StyledButton {...props} className={`${css.button} ${addStyle}`}>
            {children}
        </StyledButton >
    );
};

export default MyButton;
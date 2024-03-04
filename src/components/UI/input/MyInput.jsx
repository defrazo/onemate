import React from 'react';
import css from './MyInput.module.css';
import styled from 'styled-components';

const StyledInput = styled.input`
    background-color: ${({ theme }) => theme.elementsBackgroundColor};
    color: ${({ theme }) => theme.textColor};
`;

const MyInput = ({ addStyle, ...props }) => {
    return (
        <StyledInput {...props} className={`${css.input} ${addStyle}`} />
    );
};

export default MyInput;
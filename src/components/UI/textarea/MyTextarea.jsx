import React from 'react';
import css from './MyTextarea.module.css';
import styled from 'styled-components';

const StyledTextarea = styled.textarea`
    background-color: ${({ theme }) => theme.elementsBackgroundColor};
    color: ${({ theme }) => theme.textColor};
`;

const MyTextarea = ({ addStyle, ...props }) => {
    return (
        <StyledTextarea {...props} className={`${css.textarea} ${addStyle}`} />
    );
};

export default MyTextarea;
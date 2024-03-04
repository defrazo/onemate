import React from 'react';
import css from './MySelect.module.css';
import styled from 'styled-components';

const StyledSelect = styled.select`
    background-color: ${({ theme }) => theme.elementsBackgroundColor};
    color: ${({ theme }) => theme.textColor};
`;

const MySelect = ({ options, defaultValue, value, onChange, addStyle }) => {

    return (
        <StyledSelect
            className={`${css.select} ${addStyle}`}
            value={value}
            onChange={event => onChange(event.target.value)}
        >
            <option disabled value="">
                {defaultValue}
            </option>
            {options.map(option =>
                <option key={option.value} value={option.value}>
                    {option.name}
                </option>
            )}
        </StyledSelect>
    );
};

export default MySelect;
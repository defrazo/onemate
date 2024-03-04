import React from 'react';
import css from './Todo.module.css';
import styled from 'styled-components';

const Container = styled.div`
    background: ${({ theme }) => theme.defaultBackgroundColor};
    color: ${({ theme }) => theme.titleTextColor};
`;

function Todo() {

    return (
        <Container className={css['todo-container']}>
            <h2>Здесь мог бы быть классический To Do</h2>
        </Container>
    );
};

export default Todo;
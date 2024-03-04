import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Tooltip } from 'react-tooltip';
import Preloader from '../UI/preloader/Preloader';
import '../../styles/App.css';
import '../../../node_modules/react-tooltip/dist/react-tooltip.css';
import MyTextarea from '../UI/textarea/MyTextarea';
import css from './Notes.module.css';
import styled from 'styled-components';

const StyledComponents = {
    Container: styled.div`
        background: ${({ theme }) => theme.backgroundColor};
        color: ${({ theme }) => theme.textColor};
    `,
    Header: styled.div`
        color: ${({ theme }) => theme.titleTextColor};
        &.help {
            ${css['title']}
        }
    `,
};

const Notes = () => {
    const userId = useSelector(state => state.user.currentUser.id);
    const [user, setUser] = useState({});
    const [textData, setTextData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [textareas, setTextareas] = useState(['', '', '', '', '']);

    useEffect(() => {
        const source = axios.CancelToken.source();

        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/auth`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                setTextData(response.data.user.textData || []);
                setUser(response.data.user);
                setIsLoading(true);
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при получении данных о текстовых полях:', error);
            }
        };

        fetchData();

        return () => {
            source.cancel('Компонент размонтирован');
        };
    }, [userId]);

    useEffect(() => {
        if (isLoading && textData.length !== 0) {
            setTextareas(textData[0]);
        }
    }, [isLoading]);

    const saveField = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/save/save-text', {
                textareas: textareas,
                userId: userId,
            });
            console.log('Данные отправлены')
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
        }
    };

    const fieldValue = (index, event) => {
        const updatedTextareas = [...textareas];

        updatedTextareas[index] = event.target.value;
        setTextareas(updatedTextareas);
        if (updatedTextareas.every(textarea => textarea.trim() !== '')) {
            setTextareas([...updatedTextareas, '']);
        } else if (event.target.value === '') {
            setTextareas(prevTextareas => prevTextareas.filter((_, i) => i !== index));
        }
    };

    const fieldsResize = (index) => {
        const textarea = document.getElementById(`dynamicTextarea-${index}`);

        if (textarea && textarea.rows !== '1') {
            textarea.style.rows = textarea.scrollHeight + textarea.value.split('\n').length - 1;
        }
    };

    const fieldsClear = (index) => {
        const textarea = document.getElementById(`dynamicTextarea-${index}`);

        if (index !== undefined && textarea && textarea.value !== '') {
            const isConfirmed = window.confirm("Удалить содержимое?");

            if (isConfirmed) {
                setTextareas((prevTextareas) => {
                    const updatedTextareas = [...prevTextareas];

                    updatedTextareas[index] = '';
                    return updatedTextareas;
                });
            }
        }
    };

    const checking = () => {
        const filteredTextareas = textareas.filter(value => value === '');

        if (filteredTextareas.length > 1 && textareas.length > 5) {
            setTextareas(prevTextareas => {
                const updatedTextareas = [...prevTextareas];
                const emptyIndexes = updatedTextareas.reduceRight((acc, value, index) => {
                    if (value === '') {
                        acc.push(index);
                    }
                    return acc;
                }, []);

                emptyIndexes.slice(1).forEach(indexToRemove => {
                    updatedTextareas.splice(indexToRemove, 1);
                });

                return updatedTextareas;
            });
        }
    };

    useEffect(() => {
        checking();
    }, [textareas]);

    return (
        <StyledComponents.Container className={css['notes-container']}>
            <StyledComponents.Header className={`title ${css.help}`} id="help">
                Заметки
            </StyledComponents.Header>
            <Tooltip
                anchorSelect="#help"
                content="При заполнении всех доступных ячеек будет добавлена пустая"
            />
            {loading ? (
                <Preloader />
            ) : (
                <div className={css['notes-container__notes']}>
                    {textareas.map((value, index) => (
                        <div className={css['notes-container__notes__note']} key={index}>
                            <MyTextarea
                                key={index}
                                id={`dynamicTextarea-${index}`}
                                className="dynamicTextarea"
                                addStyle={css['notes-container__notes__note__textarea']}
                                value={value}
                                onChange={(event) => fieldValue(index, event)}
                                onMouseOver={() => fieldsResize(index)}
                                onBlur={() => saveField()}
                                placeholder="..."
                            />
                            <span
                                key={`clr-${index}`}
                                className={css['notes-container__notes__note__clear-btn']}
                                title="Очистить"
                                onClick={() => fieldsClear(index)}
                            >
                                x
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </StyledComponents.Container>
    );
};

export default Notes;
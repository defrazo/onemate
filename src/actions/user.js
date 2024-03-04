import axios from 'axios';
import { setUser } from '../reducers/userReducer';
import { toast } from 'react-toastify';

export const registration = async (email, password, dispatch) => {

    try {
        const response = await axios.post('http://localhost:5000/api/auth/registration', {
            email,
            password
        });

        const message = Array.isArray(response.data.message) ? response.data.message.join(' ') : response.data.message;
        toast.success(message);
        dispatch(setUser(response.data.user));
        localStorage.setItem('token', response.data.token);
    } catch (e) {
        if (e.response && e.response.data) {
            const message = Array.isArray(e.response.data.message) ? e.response.data.message.join(' ') : e.response.data.message;
            toast.error(message);
        }
    }
};

export const login = (email, password) => {
    return async dispatch => {

        try {
            const response = await axios.post(`http://localhost:5000/api/auth/login`, {
                email,
                password
            });

            if (response.data.token) {
                dispatch(setUser(response.data.user));
                localStorage.setItem('token', response.data.token);
                toast.success('Авторизация успешна!');
            }
        } catch (e) {
            if (e.response.data.message) {
                toast.error(e.response.data.message);
            } else {
                toast.error('Произошла ошибка при попытке входа. Пожалуйста, попробуйте еще раз.');
            }
        }
    };
};

export const auth = () => {
    return async dispatch => {

        try {
            const response = await axios.get(`http://localhost:5000/api/auth/auth`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            dispatch(setUser(response.data.user));
            localStorage.setItem('token', response.data.token);
        } catch (e) {
            localStorage.removeItem('token');
        }
    };
};
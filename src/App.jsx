import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from './actions/user';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/UI/navbar/Navbar';
import Registration from './components/UI/authorization/Registration';
import Portal from './components/UI/portal/Portal';
import Login from './components/UI/authorization/Login';
import Main from './pages/Main/Main';
import Footer from './components/UI/footer/Footer';
import Todo from './pages/Todo/Todo';
import SliderGroup from './components/UI/slider/Slider';
import Preloader from './components/UI/preloader/Preloader';
import './styles/App.css';
import 'react-toastify/dist/ReactToastify.css';
import css from './styles/App.module.css';
import { lightTheme, darkTheme } from './components/UI/themes/Theme';
import Calculator from './assets/img/calculator.png';
import Wallet from './assets/img/wallet.png';
import Calendar from './assets/img/calendar.png';
import Time from './assets/img/time.png';
import Note from './assets/img/note.png';

const slideContents = [
    { image: Calculator, text: 'Калькулятор' },
    { image: Wallet, text: 'Валюта' },
    { image: Calendar, text: 'Календарь' },
    { image: Time, text: 'Дата' },
    { image: Note, text: 'Заметки' },
];

function App() {
    const dispatch = useDispatch();
    const isAuth = useSelector(state => state.user.isAuth);
    const location = useLocation();
    const [currentTheme, setCurrentTheme] = useState(darkTheme);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlured, setIsBlured] = useState(false);
    const navigate = useNavigate();

    const toggleTheme = () => {
        setCurrentTheme(prevTheme => (prevTheme === darkTheme ? lightTheme : darkTheme));
    };

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(auth());
            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        const isLoginPath = location.pathname === '/login' || location.pathname === '/registration';

        isLoginPath
            ? setIsBlured(true)
            : setIsBlured(false);

    }, [location.pathname]);

    return (
        <ThemeProvider theme={currentTheme}>
            <ToastContainer />
            {loading ? (
                <Preloader />
            ) : (
                <div className={`app ${isAuth ? '' : css['app__default-background']} ${isBlured ? css['app__blur-background'] : ''}`}>
                    <Navbar />

                    <Routes>
                        {!isAuth ? (
                            <>
                                <Route path="/login" element={<Portal><Login navigate={navigate} setIsOpen={setIsOpen} /></Portal>} onClick={() => setIsOpen(true)} />
                                <Route path="/registration" element={<Portal><Registration navigate={navigate} setIsOpen={setIsOpen} /></Portal>} onClick={() => setIsOpen(true)} />
                                <Route path="/*" element={<Navigate to="/" replace />} />
                            </>
                        ) : (
                            <>
                                <Route path="/main" element={<Main />} />
                                <Route path="/todo" element={<Todo />} />
                                <Route path="/*" element={<Navigate to="/main" replace />} />
                            </>
                        )}
                    </Routes>
                    <div className={`${css['app__welcome-message']} ${isAuth ? css['app__welcome-message--hidden'] : ''}`}>
                        <h2>Great Events <br /> Start Here</h2>
                        <div className={css['app__slider-container']}>
                            <SliderGroup slides={slideContents} />
                            <SliderGroup slides={slideContents} />
                        </div>
                    </div>
                    <Footer toggleTheme={toggleTheme} />
                </div>
            )}
        </ThemeProvider>
    );
};

export default App;
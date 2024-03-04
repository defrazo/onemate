import React from 'react';
import Toogle from '../../../assets/img/toogle.png';
import css from './Themes.module.css';

const ThemeToggle = ({ toggleTheme }) => {
  return (
    <img className={css['switcher']} src={Toogle} alt="Ночной/Дневной режим" onClick={toggleTheme} />
  );
};

export default ThemeToggle;
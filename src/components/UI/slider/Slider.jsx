import React from 'react';
import css from './Slider.module.css';

const SliderGroup = ({ slides }) => (
    <div className={css['app__slider-container__carousel']}>
        {slides.map((slide, index) => (
            <div key={index} className={css['app__slider-container__slide']}>
                <div className={css['app__slider-container__slide__content']}>
                    <img className={css['app__slider-container__slide__image']} src={slide.image} />
                </div>
                <span>{slide.text}</span>
            </div>
        ))}
    </div>
);

export default SliderGroup;
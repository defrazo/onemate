[![React](https://img.shields.io/badge/React-19-blue)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC)](#)
[![MobX](https://img.shields.io/badge/MobX-6.x-orange)](#)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF)](#)
[![Supabase](https://img.shields.io/badge/Supabase-DB-3FCF8E)](#)
[![version](https://badgen.net/badge/version/v1.2.1?icon=tag&scale=1)](#)

# OneMate – твое личное рабочее пространство

**OneMate** – современное веб-приложение, которое включает в себя многофункциональный виджет-хаб (калькулятор, календарь, заметки, конвертер валют, погода, переводчик), канбан-доску и удобный ToDo.

> [!IMPORTANT]
>
> Посмотреть проект в деле:
>
> [![OneMate](https://img.shields.io/badge/OneMate-Перейти_на_сайт-e18127?style=for-the-badge&logo=appveyor&logoColor=white)](https://onemate.letunoff.ru)

## Технологический стек

### Frontend

- **React** + **TypeScript** – компонентная архитектура и строгая типизация;
- **FSD (Feature-Sliced Design)** – четкое разделение ответственности и масштабируемая структура;
- **Tailwind CSS** – единый визуальный стиль и быстрая адаптивная вёрстка;
- **MobX** – реактивное управление состоянием с лаконичным синтаксисом;
- **Vite** – быстрый запуск и оптимизированная сборка.

### Backend

- **Supabase** – быстрое развёртывание базы данных и аутентификации без отдельного backend.

### DevOps & Infrastructure

- **Docker** – контейнеризация приложений и унификация окружения;
- **Docker Compose** – управление многоконтейнерной инфраструктурой;
- **Nginx** – reverse proxy и раздача приложений;
- **VPS** – деплой и администрирование проекта.

## Возможности

- OAuth 2.0 (Google) и email-авторизация;
- адаптивный интерфейс для всех экранов и ориентаций (от iPhone SE 2016 до 2K-мониторов);
- кроссбраузерная совместимость с частичной поддержкой устаревающих технологий;
- светлая и тёмная тема;
- персональный профиль с аватаркой, личными и контактными данными;
- просмотр активных сессий и истории последних входов;
- смена пароля и удаление профиля;
- демо-режим для публичного доступа (GDPR-совместимый);
- политика конфиденциальности и пользовательское соглашение.

## Модули

**Dashboard** – набор из 6 встроенных мини-инструментов (виджетов) для повседневных задач.

- калькулятор с поддержкой истории вычислений;
- календарь с выбором, подсчётом и экспортом периодов;
- заметки с быстрым сохранением, удобным просмотром и drag & drop сортировкой;
- конвертер валют с экспортом курса и результатов конвертации;
- погода с определением местоположения и прогнозом на 5 дней;
- переводчик с широкой поддержкой языков.

**Kanban** – доска для визуального управления задачами и проектами.

- создание, удаление и сортировка задач и колонок с drag & drop;
- настройка внешнего вида доски и карточек (цвета, приоритеты, метки);
- минималистичный и современный интерфейс для управления задачами;
- синхронизация с базой данных для сохранения прогресса между сессиями.

## Скриншоты

<details>
  <summary>Показать</summary>
   <p align="center">
    <img src="./docs/screenshots/home.webp" alt="Home" width="800">
    <br>
    <img src="./docs/screenshots/dashboard.webp" alt="Dashboard" width="800">
    <br>
    <img src="./docs/screenshots/kanban.webp" alt="Kanban" width="800">
    <br>
    <img src="./docs/screenshots/profile.webp" alt="Profile" width="800">
  </p>
</details>

## Автор

> [!TIP]
>
> #### Евгений Летунов
>
> [![Евгений Летунов](https://img.shields.io/badge/%D0%95%D0%B2%D0%B3%D0%B5%D0%BD%D0%B8%D0%B9_%D0%9B%D0%B5%D1%82%D1%83%D0%BD%D0%BE%D0%B2-Frontend_Dev-0A66C2?style=for-the-badge&logo=react&logoColor=white)](https://letunoff.ru) [![Telegram](https://img.shields.io/badge/@defrazo-Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/defrazo)

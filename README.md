# Corporate Benefits Platform

MVP платформы корпоративных льгот для хакатона Click (Fintech).

## Стек

- **Backend:** Java 21, Spring Boot 3.5, PostgreSQL, Liquibase, ZXing (QR)
- **Frontend:** React + Vite + Tailwind CSS
- **Mobile:** Expo / React Native
- **Infra:** Docker Compose

## Быстрый старт

### Docker (рекомендуется)

```bash
cd /Users/frdmlvver/Desktop/corporate
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

### Локально

**1. Postgres**

```bash
docker run -d --name corporate-pg \
  -e POSTGRES_DB=corporate_benefits \
  -e POSTGRES_USER=corporate \
  -e POSTGRES_PASSWORD=corporate \
  -p 5433:5432 postgres:16-alpine
```

**2. Backend**

```bash
cd backend
./mvnw spring-boot:run
```

**3. Frontend**

```bash
cd web
npm install
npm run dev
```

Web: http://localhost:5173

**4. Mobile**

```bash
cd mobile
npm install
npx expo start
```

Фейковый логин:
- сотрудник: `ali` / `1234`
- админ: `admin` / `1234`

## Демо-сценарий

1. **Сотрудник** — выбрать Ali Karimov → каталог → FitZone → «Получить льготу»
2. **Мерчант** — FitZone Premium → «Одобрить»
3. **Сотрудник** — confetti + QR-код, баланс уменьшился
4. **Админ** — транзакции и статистика
5. Переключить компанию на **Uzum Tech** — другие сотрудники и баланс

## API

| Метод | Endpoint | Описание |
|---|---|---|
| GET | /api/companies | Список компаний |
| GET | /api/employees?companyId= | Сотрудники компании |
| GET | /api/catalog | Каталог льгот |
| POST | /api/applications | Создать заявку |
| POST | /api/applications/{id}/approve | Одобрить |
| POST | /api/applications/{id}/reject | Отклонить |
| GET | /api/applications/{id}/qr | QR-код (PNG) |
| GET | /api/admin/stats | Статистика |

## Структура

```
corporate/
├── backend/          Spring Boot API
├── web/              React frontend (3 роли)
├── mobile/           Expo app (сотрудник / админ)
├── docker-compose.yml
└── README.md
```

## Seed-данные

- **Click Office:** Ali (12500), Dilnoza (8000), Jasur (15000)
- **Uzum Tech:** Madina (10000), Bekzod (6000)
- **Мерчанты:** FitZone, Osh Markazi, IT Academy, MedPlus, Travel UZ

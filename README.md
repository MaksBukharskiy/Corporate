# Corporate

Экосистема корпоративных льгот: удобно компании (HR / админ / менеджеры) и просто сотруднику — от доступа до использования бенефита.

Один digital-контур вместо Excel и чатов: код доступа → интересы → каталог → покупка / запись → календарь → QR. Внутри — **Lin**, персональный помощник по льготам.

## Структура

```
corporate/
├── mobile/   Android (Jetpack Compose) — сотрудник, мерчант, админ
└── web/      десктоп для HR, мерчанта и оператора платформы
```

## Web

```bash
cd web
npm install
npm run dev
```

Демо-вход: клик по карточке роли. Сотрудникам сайт не нужен — см. [`web/README.md`](web/README.md).

## Mobile

1. Открыть `mobile/` в Android Studio **или**:

```bash
cd mobile
export JAVA_HOME="/path/to/jdk-17+"
./gradlew :app:installDebug
adb shell am start -n uz.click.benefits.nativeapp/uz.click.benefits.MainActivity
```

2. Демо-вход:
   - **Сотрудник:** `ali@click.uz` · код `1234` (или `CORP-2026`)
   - **Мерчант:** `nodira@fitzone.uz` · тот же код
   - **Админ:** `admin@click.uz` · тот же код

Данные — in-memory (`AppStore` + `Seed`), без бэкенда.

### Что внутри (mobile)

| Роль | Возможности |
|------|-------------|
| **Сотрудник** | логин по почте + коду, онбординг интересов, каталог, кошелёк баллов, заявки (недельный календарь), QR, Lin |
| **Мерчант** | офферы, входящие заявки, смена статусов |
| **Админ** | обзор, люди, партнёры, операции |

**Категории льгот:** спорт, еда, образование, здоровье, транспорт, ивенты (платные и бесплатные).

**Lin:** локальный Ollama `qwen2.5:7b` + RAG по данным приложения; эмулятор → `10.0.2.2:11434`. Без Ollama — fallback на локальный RAG.

**Стек:** Kotlin · Jetpack Compose · Material3 · ViewModel (`AppStore`) · ZXing (QR)  
Package: `uz.click.benefits` · applicationId: `uz.click.benefits.nativeapp` · minSdk 26

Подробнее — [`mobile/README.md`](mobile/README.md).

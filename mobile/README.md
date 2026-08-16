# Corporate — Android

Native Jetpack Compose клиент платформы корпоративных льгот.

## Запуск

**Android Studio:** File → Open → `mobile/` → Run на эмуляторе.

**CLI:**

```bash
cd mobile
export JAVA_HOME="/path/to/jdk-17+"
./gradlew :app:installDebug
adb shell am start -n uz.click.benefits.nativeapp/uz.click.benefits.MainActivity
```

Metro / Node / Expo не нужны.

## Демо-вход

Вход: **рабочая почта + код доступа** (саморегистрации нет).

| Роль | Email | Код |
|------|-------|-----|
| Сотрудник | `ali@click.uz` | `1234` |
| Мерчант | `nodira@fitzone.uz` | `1234` |
| Админ | `admin@click.uz` | `1234` |

Также принимается код `CORP-2026`. Данные живут в памяти процесса.

## Экраны сотрудника

1. **Логин** — email, код, CTA «Продвигать свои услуги»
2. **Интересы** — онбординг 3–6 тем → рекомендации
3. **Главная** — рекомендации, активность
4. **Каталог** — категории, деталка оффера, покупка / запись
5. **Lin** — AI-чат по льготам
6. **Заявки** — недельный календарь, деталка + QR
7. **Ещё** — профиль, тема, баланс, сохранённое

## Lin (AI)

- Модель: Ollama **`qwen2.5:7b`**
- Контекст: `RagEngine` по каталогу, балансу, заявкам
- Эмулятор: `http://10.0.2.2:11434`
- Если Ollama недоступна — локальный RAG-ответ

## Стек

- Kotlin, Compose BOM, Material3
- `AppStore` (ViewModel) + `Seed`
- ZXing для QR
- applicationId: `uz.click.benefits.nativeapp`

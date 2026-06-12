# Stream Commands Pages

Статическая GitHub Pages-страница со списком команд Twitch-чата.

## Как обновлять команды без редактирования кода

1. Откройте `src/data/commands.json`.
2. Измените категории, команды или описания.
3. Сохраните файл и сделайте commit/push в `main`.
4. GitHub Actions автоматически проверит данные, пересоберет страницу и задеплоит обновление.

## Формат команд

Каждая команда описывается так:

```json
{
  "triggers": ["!пример", "!example"],
  "description": "описание команды"
}
```

Категория содержит `id`, `name` и список `commands`.

## Локальный запуск

```bash
npm install
npm run build
```

После сборки откройте `dist/index.html`.

## Скрипты

- `npm run validate` — проверка структуры и конфликтов команд.
- `npm run build` — валидация + генерация страницы в `dist`.
- `npm run dev` — быстрый локальный просмотр `dist`.

## GitHub Pages

Репозиторий настроен под Project Pages: `https://<username>.github.io/stream-pages`.

# Настройка Vercel + GitHub API + Vercel KV

## Шаг 1: Создание GitHub Personal Access Token

1. Зайдите на https://github.com/settings/tokens
2. Нажмите "Generate new token (classic)"
3. Дайте имя: "Pizza Roma Admin"
4. Выберите scopes: ✅ `repo` (Full control of private repositories)
5. Нажмите "Generate token"
6. **Скопируйте токен сразу** (больше не покажет!)

## Шаг 2: Развёртывание на Vercel

### Вариант A: Через Vercel CLI
```bash
# Установите Vercel CLI
npm i -g vercel

# Залогиньтесь
vercel login

# Инициализируйте проект
vercel
```

### Вариант B: Через веб-интерфейс (рекомендуется)
1. Зайдите на https://vercel.com/new
2. Импортируйте репозиторий: `Tor2024/pizza-roma-siegen`
3. Нажмите "Deploy"

## Шаг 3: Настройка Environment Variables

В панели Vercel (Project Settings → Environment Variables) добавьте:

| Variable | Value | Описание |
|----------|-------|----------|
| `GITHUB_TOKEN` | `ghp_xxxxxxxx` | Токен из шага 1 |
| `GITHUB_OWNER` | `Tor2024` | ✅ Ваш логин GitHub |
| `GITHUB_REPO` | `pizza-roma-siegen` | ✅ Имя репозитория |
| `ADMIN_SECRET` | `любой-сложный-пароль` | Пароль для входа в /admin |
| `KV_URL` | (авто) | Vercel KV добавит сам |
| `KV_REST_API_URL` | (авто) | Vercel KV добавит сам |
| `KV_REST_API_TOKEN` | (авто) | Vercel KV добавит сам |
| `KV_REST_API_READ_ONLY_TOKEN` | (авто) | Vercel KV добавит сам |

## Шаг 4: Подключение Vercel KV

1. В панели проекта на Vercel перейдите во вкладку **Storage**
2. Нажмите **Create Database**
3. Выберите **KV (Redis)**
4. Нажмите **Connect** к вашему проекту
5. Переменные окружения добавятся автоматически!

## Шаг 5: Пересборка проекта

После настройки переменных:
```bash
vercel --prod
```

Или в панели Vercel: **Deployments → Redeploy**

## Проверка работы

### Админ-панель
1. Откройте `https://your-site.vercel.app/admin`
2. Введите пароль (ADMIN_SECRET)
3. Должен открыться дашборд с заказами

### Обновление меню
1. В админке перейдите на вкладку "Меню и Настройки"
2. Измените цены или настройки
3. Нажмите "Сохранить изменения в GitHub"
4. Через 45-60 секунд сайт обновится автоматически

### Создание заказа
```bash
curl -X POST https://your-site.vercel.app/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"name": {"ru":"Пицца","de":"Pizza"}, "quantity": 1, "price": 11.90}],
    "customer": {"name":"Test","phone":"+49 123","address":"Teststr 1"},
    "total": 15.40,
    "subtotal": 11.90,
    "deliveryFee": 3.50
  }'
```

## Архитектура

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  Vercel API  │────▶│  Vercel KV  │
│  (Browser)  │     │  (/api/...)  │     │  (Orders)   │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  GitHub API  │
                     │  (Menu.json) │
                     └──────────────┘
```

## Цена: $0
- Vercel Hosting: Бесплатно (до 100GB/месяц)
- Vercel KV: Бесплатно (до 30K запросов/день)
- GitHub API: Бесплатно
- Всё остальное: Бесплатно!

## Безопасность
- ✅ ADMIN_SECRET проверяется на каждый запрос
- ✅ GitHub токен не виден клиентам
- ✅ Заказы хранятся в зашифрованной KV
- ✅ Middleware защищает все admin роуты

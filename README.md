# HENTA BaseBot
> Идеальный шаблон для Вашего бота любого направления

## Архитектура директорий
* assets - ресурсы для бота
* config - конфиги бота
* data - информация для бота (игровые предметы, товары и т.д.)
* 3rdparty - сторонние ПО и библиотеки для бота
* src - исходный код бота
* temp - временные файлы, создаваемые ботом
* cache - кэшированные данные бота

## Конфигурация бота
* public.json - конфиг бота для henta и мелких плагинов'
* private.json - пароли и другие секретные данные
* plugins.json - список активных плагинов
* plugins-meta.json - список плагинов и репозиториев для их автоустановки/обновлений
* bot.json - поведение бота (плагин common/bot)
* pex.json - система ролей и прав (плагин common/pex)

## Установка
1. Установите redis, nodejs 15.0.1 и yarn.
2. Скопируйте этот репозиторий к себе.
3. Установите зависимости. (yarn)
4. Впишите ID Вашей группы в config/public.json
5. Впишите токен группы и данные для БД в config/private.json
6. Запустите бота. (yarn start)

### Подробнее
Проверено на ubuntu 18, остальным F.
```
sudo apt update
```

#### Установка Redis
```
sudo apt install redis-server
```
#### Установка Node JS и Yarn
```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

nvm install 15.0.1
nvm use 15.0.1
sudo npm install -g yarn
```

#### Установка зависимостей
```
yarn
```

#### Настройка плагина db
Сначала запустите хенту, чтобы все плагины установились. Бот не запустится, ибо потребует установить пакет для работы базы данных самостоятельно.

```
yarn start
```
Ждём установки плагинов...
```
cd src/plugins/common/db
yarn add sqlite3
```

Так как плагин common/db наследуется от Sequelize, то и пользоваться им нужно также. Строка подключения к ДБ указывается в config/private.json (по умолчанию -- sqlite3), что позволяет использовать любую доступную базу данных. К примеру, postgresql.

#### Запуск бота
yarn start
# HENTA BaseBot
> Идеальный шаблон для Вашего бота любого направления

## Архитектура директорий
* assets - ресурсы для бота
* config - конфиги бота
* data - информация для бота (игровые предметы, товары и т.д.)
* 3rdparty - сторонние ПО и библиотеки для бота
* src - исходный код бота
* temp - временные файлы, создаваемые ботом

## Конфигурация бота
* public.json - конфиг бота для henta и мелких плагинов'
* private.json - пароли и другие секретные данные
* plugins.json - список активных плагинов
* bot.json - поведение бота (плагин common/bot)
* pex.json - система ролей и прав (плагин common/pex)

## Установка
1. Установите postgresql, redis, nodejs 12.14.1 и yarn.
2. Скопируйте этот репозиторий к себе.
3. Установите зависимости. (yarn)
4. Создайте пользователя и базу данных в postgresql
4. Впишите ID Вашей группы в config/public.json
5. Впишите токен группы и данные для БД в config/private.json
6. Запустите бота. (yarn start)

### Подробнее
Проверено на ubuntu 18, остальным F.
```
sudo apt update
```
#### Установка Postgresql
```
sudo apt install postgresql postgresql-contrib
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

nvm install 12.14.1
nvm use 12.14.1
sudo npm install -g yarn
```
#### Создание пользователя и БД Postgresql
> Не забудьте поменять данные на свои.
```
sudo -u postgres psql
postgres=# create database db_mybot;
postgres=# create user myuser with encrypted password 'password';
postgres=# grant all privileges on database db_mybot to mybot;
```
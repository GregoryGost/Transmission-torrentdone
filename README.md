# Transmission daemon torrent done application script

![License](https://img.shields.io/github/license/GregoryGost/transmission-torrentdone)
![RepoSize](https://img.shields.io/github/repo-size/GregoryGost/transmission-torrentdone)
![CodeSize](https://img.shields.io/github/languages/code-size/GregoryGost/transmission-torrentdone)
![IssuesOpen](https://img.shields.io/github/issues-raw/GregoryGost/transmission-torrentdone)
![LatestRelease](https://img.shields.io/github/v/release/GregoryGost/transmission-torrentdone)
![LatestTag](https://img.shields.io/github/v/tag/GregoryGost/transmission-torrentdone?sort=date&logo=substack&logoColor=white)
![CI](https://github.com/GregoryGost/transmission-torrentdone/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/GregoryGost/transmission-torrentdone/actions/workflows/check-dist.yml/badge.svg)](https://github.com/GregoryGost/transmission-torrentdone/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/GregoryGost/transmission-torrentdone/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/GregoryGost/transmission-torrentdone/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)
![Watchers](https://img.shields.io/github/watchers/GregoryGost/transmission-torrentdone)
![RepoStars](https://img.shields.io/github/stars/GregoryGost/transmission-torrentdone)

Создано в рамках статьи для блога:
[Домашний Сервер: Часть 4 – Настройка Transmission daemon в контейнере LXC Proxmox-VE](https://gregory-gost.ru/domashnij-server-chast-4-nastrojka-transmission-daemon-v-kontejnere-lxc-proxmox-ve/)

[Пример `Debug` лога обработки одного файла](./EXAMPLE.md)

## Оглавление

<!--ts-->

- [Описание](#описание)
- [Установка](#установка)
  - [Конфигурирование](#конфигурирование)
- [Обновление](#обновление)
- [Алгоритм обработки торрентов](#алгоритм-обработки-торрентов)
- [Правила именования торрентов для корректной работы скрипта](#правила-именования-торрентов-для-корректной-работы-скрипта)
  - [Сериалы](#сериалы)
    - [Примеры названия сериалов](#примеры-названия-сериалов)
  - [Фильмы](#фильмы)
- [Ротация логов](#ротация-логов)
- [Лицензирование](#лицензирование)

<!--te-->

## Описание

Основной кодовой базой является программная платформа [Node.js](https://nodejs.org/) основанная на движке
[V8](https://v8.dev/)

Данное приложение выполняется после завершения скачивания каждого торрента в сервисе Transmission daemon  
Для его работы он должен быть настроен в файле конфигурации `settings.json` через параметры
`script-torrent-done-enabled` и `script-torrent-done-filename`

```json
"script-torrent-done-enabled": true,
"script-torrent-done-filename": "/opt/torrentdone/index.js",
"umask": 0,
```

История версий:

- v3.1.0 - (22.09.2024) - Поправлено получение имени сериала. Изменено регулярное выражение для обработки сериалов
  LostFilm. Изменился формат. Пример `The Penguin S01E01.1080p.rus.LostFilm.TV.mkv`
- v3.0.0 - (21.04.2024) - Изменена архитектура итогового приложения. Теперь нет необходимости ставить зависимости. Все
  собрано в единый `index.js` файл. Достаточно только базового Node.js. Дополнительно осуществлен переход на новую
  библиотеку логирования, покрытие юнит тестами и прочее.
- v2.0.2 - (19.08.2023) - Обновлено совпадение для файлов сериалов. Ранее учитывался только вариант с малыми буквами
  сезона и эпизода. Теперь учитываются и большие буквы. Также не учитывался разделитель сезона и эпизода. Ранее:
  `s01e01`. Теперь возможны варианты: `S01E01`, `S01e01`, `S01.E01`, `S01-E01`, `S01_E01`
- v2.0.1 - (20.12.2022) Параметры перенесены из окружения в конфигурационный файл для удобства. Используется пакет
  `nconf`. Поправлены команды для `transmission-remote`
- v2.0.0 - (12.01.2022) Полностью заменен файл **torrentdone.sh** на **Node.js** проект. Изменена и расширена логика
  обработки, улучшено логирование (уровни info, debug, etc) и многое другое. Для разработчиков доступно тестирование
  через Jest.
- v1.2.4 - (17.10.2022) Поправлена обработка имени для папки сериала если это папка с целым сезоном. Вместо имени папки
  теперь используется имя торрента.
- v1.2.3 - (11.02.2021) Поправлены regex_film и regex_film_dir для определения фильмов. Bash не хочет понимать \d, хотя
  норм понимает \s. Странности.
- v1.2.2 - (08.02.2021) Поправлено определение фильм или сериал после определения файл или дирректория. Теперь коллекции
  необходимо корректно именовать.
- v1.2.1 - (26.01.2021) Удален параметр CLEARFLAG т.к. не используется.
- v1.2.0 - (19.01.2021) Доработаны функции обработки файлов сериалов и фильмов. Поправлена работа с именем файла.
- v1.1.0 - (09.01.2021) Переработан алгоритм и функции для работы с торрентами в которых загружаются несколько файлов
  сразу (т.е. они загружаются папкой с файлами)
- v1.0.0 - (31.03.2020) Исправлена ошибка с кириллическими символами в имени файла при переходе в функцию
- v0.9.16 - (24.03.2020) Улучшено комментирование кода
- v0.9.15 - (21.03.2020) Добавлена обработка торрентов с несколькими файлами (папками). Изменен принцип логирования
- v0.0.8 - (18.04.2018) Изменено регулярное выражение regex_film
- v0.0.7 - (18.04.2018) Улучшено структурирование и комментирование кода
- v0.0.6 - (17.04.2018) Улучшено комментирование кода
- v0.0.5 - (17.04.2018) Изменена версия на корректную
- v0.0.4 - (17.04.2018) Поправлено регулярное выражение regex_film
- v0.0.3 - (17.04.2018) Улучшено комментирование кода
- v0.0.2 - (17.04.2018) Улучшено комментирование кода
- v0.0.1 - (17.04.2018) Исправлены условия определяющие корректно ли перемещен файл
- NV - (17.04.2018) Первая версия

Перед стартом, transmission генерирует переменные в Environment:  
Для версии 3.00

- TR_APP_VERSION: версия Transmission
- TR_TORRENT_ID: идентификатор (ID) торрента
- TR_TORRENT_NAME: имя торента в том виде, как оно отображается в интерфейсе Transmission Remote GUI
- TR_TORRENT_DIR: текущая папка торрента
- TR_TORRENT_HASH: хэш торрента
- TR_TIME_LOCALTIME: дата и время запуска скрипта
- TR_TORRENT_LABELS: тэги/метки присвоенные торренту

Начиная с версии 4.0.0 добавляются еще две

- TR_TORRENT_BYTES_DOWNLOADED: размер загруженных данных в байтах
- TR_TORRENT_TRACKERS: список URL анонсированных трекеров

## Установка

Нужно поставить Node.js и менеджер пакетов PNPM  
Команды для Proxmox LXC Debian под root

```shell
apt update && apt upgrade -y && apt install -y curl wget
```

Ставим Node.js  
Пойти в <https://github.com/nodesource/distributions/blob/master/README.md>  
Выбрать LTS версию не ниже 20

```shell
curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt update && apt install -y nodejs
node -v
v20.17.0
```

Далее создаем папку под приложение, делаем файл исполняемым. Создаем фейковый файл `package.json` (нужно для корректного
определения корневой дирректории)

```shell
mkdir /opt/torrentdone
cd /opt/torrentdone
wget https://raw.githubusercontent.com/GregoryGost/transmission-torrentdone/refs/heads/main/dist/index.js
chmod +x index.js
touch package.json
```

### Конфигурирование

Создаем файл настроек и задаем свои параметры

```shell
nano /opt/torrentdone/config.json
```

```json
{
  "login": "transmission_login",
  "password": "<your_password>"
}
```

Назначаем папку и файлы пользователю Transmission

```shell
chown -R debian-transmission:debian-transmission /opt/torrentdone
```

Обязательные:

- `login` - Логин авторизации для transmission-remote. Прописан в файле `settings.json` самого Transmission. Как правило
  располагается по пути `/etc/transmission-daemon/`
- `password` - Пароль авторизации для transmission-remote

Опциональные:

- `node_env` - Режим использования приложения. Задать `development` если режим разработки. Default: `production`
- `log_level` - Уровень логирования. Default: `info`. Для режима разработки `trace`
- `log_file_path` - Путь до файла сохранения логов. Default: `/var/log/transmission/torrentdone.log`
- `media_path` - Путь хранения медиа файлов. Default `/mnt/data/media`
- `serials_root_dir` - Название базовой директории для сохранения файлов сериалов. Default: `TV Shows`
- `films_root_dir` - Название базовой директории для сохранения файлов фильмов. Default: `Movies`
- `date_format` - Формат вывода даты в логе и в приложении. Для форматирования в log4js используется модуль
  [date-format](https://www.npmjs.com/package/date-format) Default: `dd.MM.yyyy_hh:mm:ss.SSS` Example:
  12.11.2022_21:54:03.789
- `ip_address` - IP адрес для доступа к transmission. Default: `127.0.0.1`
- `tcp_port` - TCP порт для доступа к transmission. Default: `9091`
- `allowed_media_extensions` - Расширения файлов перечисленные через запятую для которых осуществляется обработка.
  Default: `mkv,mp4,avi`

Настройки будут считываться при каждом запуске скрипта по окончании процесса скачивания торрента.

## Обновление

Стоит обновить Node.js если скрипт поддерживает её. Как пример обновление на 20 LTS версию.

```shell
curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt update && apt upgrade -y
```

Для обновления можно просто перекачать `index.js` файл

```shell
wget -O index.js https://raw.githubusercontent.com/GregoryGost/transmission-torrentdone/refs/heads/main/dist/index.js
```

Если вы хотите обновить из другой ветки, просто поменяйте её название в пути скачивания

```shell
wget -O index.js https://raw.githubusercontent.com/GregoryGost/transmission-torrentdone/refs/heads/develop/dist/index.js
```

## Алгоритм обработки торрентов

![Transmission_torrentdone_algorithm.png](./aux_data/Transmission_torrentdone_algorithm.png)

## Правила именования торрентов для корректной работы скрипта

Нельзя просто так добавлять торренты в **Transmission remote GUI** или кидать торрент файлы в папку отслеживания с
данным скриптом.  
Если вы хотите, чтобы парсинг файлов и папок выполнялся корректно, необходимо соблюдать простые правила именования
торрентов.

### Сериалы

Сериалы обрабатываются с помощью регулярных выражений

Первично определяется релизер. На текущий момент в коде определяется только два релизера `LostFilm.TV` и `NovaFilm.TV`:

Если Вы наблюдаете проблемы с определением, то можете создать запрос в ISSUE

#### Примеры названия сериалов

- индивидуальные файлы **LostFilm.TV**:

```txt
The.Mandalorian.S02E07.1080p.rus.LostFilm.TV.mkv
The.Handmaid's.Tale.S05E03.1080p.rus.LostFilm.TV.mkv
Andor.S01E10.720p.rus.LostFilm.TV.mp4
```

- директория **LostFilm.TV** (сезон полностью):

```txt
Obi-Wan Kenobi 1 - LostFilm.TV [1080p]
Breaking Bad 5 - LostFilm.TV [1080p]
Peaky Blinders 6 - LostFilm.TV [1080p]
```

Соответственно в директории файлы имеют названия, как это описано для отдельных файлов сериала.

- индивидуальные файлы **NovaFilm.TV**:

```txt
californication.s06e08.hdtv.rus.eng.novafilm.tv.avi
```

### Фильмы

Фильмы также обрабатываются с помощью регулярных выражений  
Но важно понимать, что учесть все возможные варианты наименований с торрент трекеров достаточно сложно. Именно поэтому
нужно при добавлении одиночного фильма, корректно его назвать.

Год может обрамляться:

- скобками `(2021)`
- нижними подчеркиваниями `_2021_`
- точками `.2021.`
- просто пробелами `2021`
- комбинациями этих обрамлений

Т.е. любой файл, где год обрамлен этими знаками будет корректно вырезан из имени файла. Причём год должен быть ближе к
концу названия файла.

Корректные примеры названия фильмов:

```txt
Blade Runner 2049 (2017).mkv
Аватар 3D (2009).mkv
```

Для отдельных релизеров реализована отделная обработка файлов фильмов

```txt
All.Quiet.on.the.Western.Front.1080p.rus.LostFilm.TV.mkv
Bullet.Train.1080p.rus.LostFilm.TV.avi
```

Т.е. можно как обычно переименовать файл в понятное и обрабатываемое название, тогда фильм будет сохранен как и
положено. Но если ничего не менять, то фильм будет сохранен в папку `2D` и год будет взят текущий.

Если фильмы скачиваются трилогиями, дилогиями и т.д., то необходимо проверять внутренние файлы на наличие в них года.
Иначе файл не будет скопирован так как не определится год.

## Ротация логов

Скрипт по умолчанию пишет результат своей работы в LOG файл **torrentdone.log**  
Log файл расположен по пути, где обычно хранятся все лог файлы самого transmisson-daemon:

```shell
/var/log/transmission/torrentdone.log
```

Начиная с версии 2.0.0 скрипта `torrentdone` расположение лог файла можно задавать самому через конфигурацию.
Соответственно необходимо изменять настройки ротации с учётом нового расположения.

Ротация лог файлов обеспечивается базовой подсистемой самой ОС **logrotate**.  
Ротация происходит для всех лог файлов в папке `/var/log/transmission/`  
Расположение файла настройки ротации логов:

```shell
/etc/logrotate.d/transmission
```

После создания или загрузки файла настройки, необходимо перезапустить службу logrotate:

```shell
systemctl restart logrotate.service
systemctl status logrotate.service
```

## Лицензирование

Все исходные материалы для проекта распространяются по лицензии [GPL v3](./LICENSE 'Описание лицензии').  
Вы можете использовать проект в любом виде, в том числе и для коммерческой деятельности, но стоит помнить, что автор
проекта не дает никаких гарантий на работоспособность исполняемых файлов, а так же не несет никакой ответственности по
искам или за нанесенный ущерб.

Этот репозиторий содержит ссылки на все используемые модули и их лицензии. Они собраны в
[специальный файл лицензий](./dist/licenses.txt). Их авторы самостоятельно несут (или не несут) ответственность за
качество, стабильность и работу этих модулей.

## Немного о себе

GregoryGost - <https://gregory-gost.ru>

# Скрипт для распознавания текста в скриншоте экрана

Скрипт использует библиотеку [Yandex Vision](https://cloud.yandex.ru/docs/vision/quickstart)

Скрипт запускается из папки проекта при вводе в терминале команды **node app.js** или **npm run app**.

Скриншот выполняется при вводе в терминале команды **ctrl + k**.

Выход выполняется при вводе в терминале команды **ctrl + l**.

Файлы сохранятся в корне проекта.

Авторизационные данные берутся из файла **.env** или их можно проставить непосредственно в файле **app.js** вместо переменных **process.env.**

Ниже показан скриншот, сделанный скриптом:

![Иллюстрация к проекту](https://github.com/teplospbru/test-task-1/blob/main/shot_1653314786295.png)

В результате получаем текстовый файл:

![Иллюстрация к проекту](https://github.com/teplospbru/test-task-1/blob/main/text_file.png)
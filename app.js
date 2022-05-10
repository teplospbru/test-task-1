require('dotenv').config();
const screenshot = require('screenshot-desktop');
const fs = require('fs');
const axios = require('axios');
const Parser = require('dataobject-parser');
const readline = require('readline');

readline.emitKeypressEvents(process.stdin);
if(process.stdin.isTTY) process.stdin.setRawMode(true);

// прослушиваем в консоли "ctrl + k", чтобы запустить процесс
process.stdin.on("keypress", (str, key) => {
    if(key.ctrl && key.name == "k") {
        // делаем скриншот
        screenshot({format: 'png'})
            .then((img) => {
                // создаём уникальное имя
                unique.setFileName();
                fs.writeFileSync(unique.getFileName() + '.png', img);
                // отправляем на сервер
                send(img.toString('base64'));
            }).catch(e => console.log(e));
    }
})

// прослушиваем в консоли "ctrl + l", чтобы выйти
process.stdin.on("keypress", (str, key) => {
    if(key.ctrl && key.name == "l") process.exit(0);
})

let arr = [];

// функция отправки изображения на сервер и обработки результата
function send(encoded) {
    axios({
        method: 'post',
        url: process.env.URL,
        data: JSON.stringify(
            {
                "folderId": process.env.FOLDERID,
                "analyze_specs": [{
                    "content": encoded,
                    "features": [{
                        "type": "TEXT_DETECTION",
                        "text_detection_config": {
                            "language_codes": ["*"]
                        }
                    }]
                }]
            }
        ),
        headers: {
            'Authorization': 'Api-Key ' + process.env.APIKEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    // получаем результат с сервера
    .then(data => data.data.results[0].results[0].textDetection.pages[0].blocks)
    .then((answer) => {
        // извлекаем текст
        text(answer);
        fs.writeFileSync(unique.getFileName() + '.txt', arr.join(' '));
    })
    .catch(e => console.log(e));
}

// функция извлечения текста из ответа с сервера
function text(data) {
    // убираем вложенности у объекта ответа
    let flattened = Parser.untranspose(data)
    for(let prop in flattened) {
        if(flattened.hasOwnProperty(prop) && /text/.test(prop)) {
            arr.push(flattened[prop])
        }
    }
}

// замыкание для создания и хранения уникального названия файлов
const timestamp = function() {
    let fileName = '';
    function getName() {
        let date = new Date();
        fileName = 'shot_' + (date.getTime().toString());
    };
    return {
        setFileName: function() {
            getName();
        },
        getFileName: function() {
            return fileName;
        }
    }
}

const unique = timestamp();
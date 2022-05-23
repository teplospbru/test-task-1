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
        screenshot({format: 'png'}) // делаем скриншот
            .then((img) => {
                unique.setFileName(); // создаём уникальное имя
                fs.writeFileSync(unique.getFileName() + '.png', img); // записываем в файл
                send(img.toString('base64')); // отправляем на сервер перекодируя в base64
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
    .then(data => data.data.results[0].results[0].textDetection.pages[0].blocks) // получаем результат с сервера
    .then((answer) => {
        text(answer); // извлекаем текст
        fs.writeFileSync(unique.getFileName() + '.txt', arr.join(' ')); // записываем в файл
    })
    .catch(e => console.log(e));
}

// функция извлечения текста из ответа с сервера
function text(data) {
    let flattened = Parser.untranspose(data) // убираем вложенности у объекта ответа
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
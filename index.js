var request = require('request');
var qs = require('querystring');

var uuid = '';

var opt = {
    appid: 'wx782c26e4c19acffb',
    fun: 'new',
    lang: 'zh_CN',
    _: new Date().getTime()
};

var getUUID = function () {
    return new Promise(function (resolve, reject) {
        request.post({ url: "https://login.weixin.qq.com/jslogin", formData: opt }, function (err, httpResponse, body) {
            if (!err) {
                var data = qs.parse(body, '; ', ' = ')
                if (data['window.QRLogin.code'] == '200') {
                    resolve(data['window.QRLogin.uuid'].slice(1, -2));
                }
            }
            else {
                console.log(err);
            }
        });
    });
};

var getQRCode = function () {
    return new Promise(function (resolve, reject) {
        request.post({ url: "https://login.weixin.qq.com/l/" + uuid }, function (err, httpResponse, body) {
            if (!err) {
                console.log(body);
            }
            else {
                console.log(err);
            }
        });
    });
};

async function init() {
    uuid = await getUUID();
    console.log(uuid);
    qr = await getQRCode();
    console.log(qr);
};

init();
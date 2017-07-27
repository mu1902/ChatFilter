var request = require('request');
var qs = require('querystring');
var qr = require('qrcode-terminal');

var getUUID = function () {
    var opt = {
        appid: 'wx782c26e4c19acffb',
        fun: 'new',
        lang: 'zh_CN',
        _: +new Date
    };
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

var checkLogin = function (id) {
    var opt = {
        loginicon: true,
        tip: 0,
        uuid: id,
        _: +new Date
    };
    return new Promise(function (resolve, reject) {
        request.get({ url: "https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login", qs: opt }, function (err, httpResponse, body) {
            if (!err) {
                var data = qs.parse(body, ';', '=')
                resolve(data);
            }
            else {
                console.log(err);
                resolve(null)
            }
        });
    });
};

async function init() {
    var uuid = await getUUID();
    if (uuid == null) {
        console.log("获取UUID失败");
    } else {
        console.log(uuid);
        console.log("扫码登录");
    }
    qr.generate("https://login.weixin.qq.com/l/" + uuid);
    while (true) {
        var loginState = await checkLogin(uuid);
        if (loginState["window.code"] == '200') {
            console.log("确认登录");
            console.log(loginState["\nwindow.redirect_uri"]);
            break;
        }
        if (loginState["window.code"] == '201') {
            console.log("扫描成功");
            continue;
        }
        if (loginState["window.code"] == '408') {
            console.log("登录超时");
            init();
            return;
        }
    }
};

init();
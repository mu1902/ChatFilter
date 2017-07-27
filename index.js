var request = require('request');
var qs = require('querystring');
var qr = require('qrcode-terminal');
var $ = require('jquery')(require("jsdom").jsdom().createWindow());

var request_promise = function (url, method, formData, qs) {
    return new Promise(function (resolve, reject) {
        request({ url: url, method: method, formData: formData, qs: qs }, function (err, httpResponse, body) {
            if (!err) {
                resolve(body);
            } else {
                reject(null);
            }
        });
    });
}

var getUUID = async function () {
    var opt = {
        appid: 'wx782c26e4c19acffb',
        fun: 'new',
        lang: 'zh_CN',
        _: +new Date
    };
    var res = await request_promise("https://login.weixin.qq.com/jslogin", "POST", opt, {});
    if (res) {
        var data = qs.parse(res, '; ', ' = ')
        if (data['window.QRLogin.code'] == '200') {
            return data['window.QRLogin.uuid'].slice(1, -2);
        }
    } else {
        return res;
    }

};

var checkLogin = async function (id) {
    var opt = {
        loginicon: true,
        tip: 0,
        uuid: id,
        _: +new Date,
        r: ~new Date
    };
    var res = await request_promise("https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login", "GET", {}, opt);
    if (res) {
        var data = qs.parse(res, ';', '=')
        return data;
    } else {
        return res;
    }

};

var getTicket = async function (url) {
    var res = await request_promise(url, "GET", {}, {});
    if (res) {
        return res;
    } else {
        return res;
    }
}

var init = async function () {
    var uuid = await getUUID();
    //console.log(uuid);
    if (uuid == null) {
        console.log("获取UUID失败");
        return;
    } else {
        console.log("扫码登录");
    }
    qr.generate("https://login.weixin.qq.com/l/" + uuid);
    while (true) {
        var loginState = await checkLogin(uuid);
        if (loginState["window.code"] == '200') {
            console.log("确认登录");
            var redirect_uri = loginState["\nwindow.redirect_uri"].slice(1, -1) + '&fun=new';
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
    var ticket = await getTicket(redirect_uri);
    var $ticket = $(ticket);
    console.log($ticket.find('skey').text());
};

init();
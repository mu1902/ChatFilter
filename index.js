const request = require('request');
const qs = require('querystring');
const url = require('url');
const qr = require('qrcode-terminal');
const cheerio = require('cheerio');

const request_promise = function (option) {
    option["headers"] = [{
        name: 'Referer',
        value: 'https://wx2.qq.com/'
    }, {
        name: 'User-Agent',
        value: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36'
    }, {
        name: 'Accept',
        value: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    }];
    option["jar"] = true;
    return new Promise(function (resolve, reject) {
        request(option, function (err, httpResponse, body) {
            if (!err) {
                resolve(body);
            } else {
                reject(null);
            }
        });
    });
}

const getUUID = async function () {
    const para = {
        appid: 'wx782c26e4c19acffb',
        fun: 'new',
        lang: 'zh_CN',
        _: +new Date
    };
    const request_option = {
        url: "https://login.weixin.qq.com/jslogin",
        method: "POST",
        formData: para
    };
    const res = await request_promise(request_option);
    if (res) {
        const data = qs.parse(res, '; ', ' = ')
        if (data['window.QRLogin.code'] == '200') {
            return data['window.QRLogin.uuid'].slice(1, -2);
        }
    } else {
        return res;
    }

};

const checkLogin = async function (id) {
    const para = {
        loginicon: true,
        tip: 0,
        uuid: id,
        _: +new Date,
        r: ~new Date
    };
    const request_option = {
        url: "https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login",
        method: "GET",
        qs: para
    };
    const res = await request_promise(request_option);
    if (res) {
        const data = qs.parse(res, ';', '=')
        return data;
    } else {
        return res;
    }

};

const getTicket = async function (url) {
    const request_option = {
        url: url,
        method: "GET"
    };
    const res = await request_promise(request_option);
    if (res) {
        return res;
    } else {
        return res;
    }
}

let baseRequest = {
    Skey: '',
    Sid: '',
    Uin: '',
    DeviceID: 'e' + Math.random().toFixed(15).toString().substring(2, 17)
};
let me, members, groups;
let redirect_uri, pass_ticket, sync_key, sync_key_format;
let checkSyncTimer;
let HOST_LIST = ["webpush.weixin.qq.com",
    "webpush.wx2.qq.com",
    "webpush.wx8.qq.com",
    "webpush.wx.qq.com",
    "webpush.web2.wechat.com",
    "webpush.web.wechat.com"];

const init = async function () {
    const uuid = await getUUID();
    //console.log(uuid);
    if (uuid == null) {
        console.log("获取UUID失败");
        return false;
    } else {
        console.log("扫码登录");
    }
    qr.generate("https://login.weixin.qq.com/l/" + uuid);
    while (true) {
        const loginState = await checkLogin(uuid);
        if (loginState["window.code"] == '200') {
            console.log("确认登录");
            redirect_uri = loginState["\nwindow.redirect_uri"].slice(1, -1);
            break;
        }
        if (loginState["window.code"] == '201') {
            console.log("扫描成功");
            continue;
        }
        if (loginState["window.code"] == '408') {
            console.log("登录超时");
            init();
            return false;
        }
    }
    const ticket = await getTicket(redirect_uri + '&fun=new');
    const $ticket = cheerio.load(ticket);
    pass_ticket = $ticket('pass_ticket').text();
    baseRequest.Skey = $ticket('skey').text();
    baseRequest.Sid = $ticket('wxsid').text();
    baseRequest.Uin = $ticket('wxuin').text();

    return true;
};

const wxinit = async function () {
    if (await init()) {
        console.log(baseRequest);
        console.log("pass_ticket => " + pass_ticket);
        console.log("redirect_uri => " + redirect_uri);
        const para = {
            r: ~new Date,
            lang: 'zh_CN',
            pass_ticket: pass_ticket
        };
        const request_option = {
            url: "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit",
            method: "POST",
            qs: para,
            body: JSON.stringify({ BaseRequest: baseRequest }),

        };

        const res = await request_promise(request_option);
        me = JSON.parse(res).User;
        sync_key = JSON.parse(res).SyncKey;
        sync_key_format = JSON.parse(res).SyncKey.List.map((item) => item.Key + '_' + item.Val).join('|');
        console.log("sync_key => " + sync_key_format);
        return true;
    } else {
        return false;
    }
};


const getContacts = async function () {
    const para = {
        pass_ticket: pass_ticket,
        skey: baseRequest.Skey,
        r: +new Date
    };
    const request_option = {
        url: "https://wx.qq.com/cgi-bin/mmwebwx-bin//webwxgetcontact",
        method: "POST",
        qs: para
    };

    const res = await request_promise(request_option);
    const data = JSON.stringify(res);

    members = [];
    groups = [];
    data.MemberList.forEach((member) => {
        if (userName.includes('@@')) {
            groups.push({ groupName: member.UserName, nickName: member.NickName });
        } else {
            members.push({ userName: member.UserName, nickName: member.NickName });
        }
    });
}

const getGroupMembers = async function () {
    const para = {
        type: "ex",
        r: +new Date,
        pass_ticket: pass_ticket
    };
    const body = {
        BaseRequest: baseRequest,
        Count: 0,
        List: [];
    };
    const request_option = {
        url: "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxbatchgetcontact",
        method: "POST",
        qs: para,
        body: JSON.stringify(body)
    };

    const res = await request_promise(request_option);

}

const notifyMobile = async function () {
    const para = {
        lang: 'zh_CN',
        pass_ticket: pass_ticket,
    };
    const body = {
        BaseRequest: baseRequest,
        Code: 3,
        FromUserName: me.UserName,
        ToUserName: me.UserName,
        ClientMsgId: +new Date
    };
    const request_option = {
        url: "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxstatusnotify",
        method: "POST",
        qs: para,
        body: JSON.stringify(body)
    };

    const res = await request_promise(request_option);
    console.log(res);
}

const lookupHost = async function () {
    for (let h of HOST_LIST) {
        const para = {
            r: +new Date(),
            skey: baseRequest.Skey,
            sid: baseRequest.Sid,
            uin: baseRequest.Uin,
            deviceid: baseRequest.DeviceID,
            synckey: sync_key_format,
            _: +new Date()
        };
        const request_option = {
            url: "https://" + h + "/cgi-bin/mmwebwx-bin/synccheck",
            method: "GET",
            qs: para
        };

        const res = await request_promise(request_option);
        console.log(res);
    }
}

const synccheck = async function () {
    const para = {
        r: +new Date(),
        skey: baseRequest.Skey,
        sid: baseRequest.Sid,
        uin: baseRequest.Uin,
        deviceid: baseRequest.DeviceID,
        synckey: sync_key_format,
        _: +new Date()
    };
    const host = url.parse(redirect_uri).host;
    const request_option = {
        url: "https://" + host + "/cgi-bin/mmwebwx-bin/synccheck",
        method: "GET",
        qs: para
    };

    const res = await request_promise(request_option);
    const retcode = res.match(/retcode:"(\d+)"/)[1];
    const selector = res.match(/selector:"(\d+)"/)[1];

    clearTimeout(checkSyncTimer);

    if (retcode != '0') {
        await wxinit();
        return false;
    }

    if (selector == '2') {
        await run();
    }

    checkSyncTimer = setTimeout(() => {
        synccheck();
    }, 3e3);
};

const wxsync = async function () {
    const para = {
        sid: baseRequest.Sid,
        skey: baseRequest.Skey,
        pass_ticket: pass_ticket
    };
    const body = {
        BaseRequest: baseRequest,
        SyncKey: sync_key,
        rr: ~new Date
    };
    const request_option = {
        url: "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsync",
        method: "POST",
        qs: para,
        body: JSON.stringify(body)
    };

    const res = await request_promise(request_option);
    const message = JSON.parse(res).AddMsgList;
    messageHandle(message);
};

const messageHandle = function (message) {
    if (message.MsgType == 1) {
        console.log(message.FromUserName);
        console.log(message.Content);
    }
}

const run = async function () {
    if (await wxinit()) {
        //await notifyMobile();
        //await lookupHost();
        await synccheck();
    }
};

run();
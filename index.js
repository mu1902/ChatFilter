const babelpolyfill = require("babel-polyfill");
const request = require('request');
const qs = require('querystring');
const url = require('url');
const qr = require('qrcode-terminal');
const cheerio = require('cheerio');
const f = require("fs");

const request_promise = function (option) {
    option["headers"] = [{
        name: 'Host',
        value: 'wx.qq.com'
    }, {
        name: 'Referer',
        value: 'https://wx.qq.com/'
    }, {
        name: 'User-Agent',
        value: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36'
    }, {
        name: 'Accept',
        value: 'text/html,application/xhtml+xml,application/xml,application/json;q=0.9,image/webp,*/*;q=0.8'
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

let keyword = [];
let baseRequest = {
    Skey: '',
    Sid: '',
    Uin: '',
    DeviceID: 'e' + Math.random().toFixed(15).toString().substring(2, 17)
};
let me, members, groups;
let redirect_uri, pass_ticket, sync_key, sync_key_format;
let checkSyncTimer, updataContactTimer;
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
        //console.log(baseRequest);
        //console.log("pass_ticket => " + pass_ticket);
        //console.log("redirect_uri => " + redirect_uri);
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
        sync_key_format = sync_key.List.map((item) => item.Key + '_' + item.Val).join('|');
        //console.log(me);
        //console.log("sync_key => " + sync_key_format);
        console.log("微信初始化成功");
        return true;
    } else {
        return false;
    }
};


const getContacts = async function () {
    const para = {
        lang: 'zh-CN',
        pass_ticket: pass_ticket,
        skey: baseRequest.Skey,
        seq: 0,
        r: +new Date
    };
    const request_option = {
        url: "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact",
        method: "POST",
        qs: para,
        json: true
    };

    const res = await request_promise(request_option);

    members = [];
    groups = {};
    res.MemberList.forEach((member) => {
        if (!member.UserName.includes('@@')) {
            members.push({ userName: member.UserName, nickName: member.NickName });
        }
    });

    //console.log(members);
}

const getGroupMembers = async function (gs) {
    const para = {
        type: "ex",
        r: +new Date
    };
    const body = {
        BaseRequest: baseRequest,
        Count: gs.length,
        List: gs.map((group) => ({ UserName: group.groupName, EncryChatRoomId: '' }))
    };
    const request_option = {
        url: "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxbatchgetcontact",
        method: "POST",
        qs: para,
        body: JSON.stringify(body)
    };

    const res = await request_promise(request_option);
    const data = JSON.parse(res);

    data.ContactList.forEach((group) => {
        if (!groups[group.UserName]) {
            groups[group.UserName] = [];
        }
        group.MemberList.forEach((member) => {
            groups[group.UserName].push({
                userName: member.UserName,
                userNickName: member.NickName,
                groupNickName: group.NickName
            });
        });
    });

    // console.log(groups);
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
    const data = JSON.parse(res);
    if (data.BaseResponse.Ret == 0) {
        console.log("通知客户端成功");
    }
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
        // console.log(res);
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
        await wxsync();
    }

    //console.log([retcode, selector]);

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
    const messages = JSON.parse(res).AddMsgList;
    sync_key = JSON.parse(res).SyncKey;
    sync_key_format = sync_key.List.map((item) => item.Key + '_' + item.Val).join('|');
    // for (let m of messages) {
    //     if (m.MsgType != 51) {
    //         console.log([m.MsgType, m.FromUserName, m.Content]);
    //     }
    // }
    await messageHandle(messages);
};

const messageHandle = async function (messages) {
    for (let message of messages) {
        let isConcern = false;
        for (let w of keyword) {
            if (message.Content.indexOf(w) != -1) {
                isConcern = true;
                break;
            }
        }
        if (!isConcern) {
            continue;
        }
        if (message.MsgType == 1 && message.FromUserName != me.UserName) {
            if (message.FromUserName.includes('@@')) {
                const userId = message.Content.match(/^(@[a-zA-Z0-9]+|[a-zA-Z0-9_-]+):<br\/>/)[1];

                let group, group_member = null;
                if (!groups[message.FromUserName]) {
                    await getGroupMembers([{ groupName: message.FromUserName }]);
                }

                for (let gm of groups[message.FromUserName]) {
                    if (gm.userName == userId) {
                        group_member = gm.userNickName;
                        group = gm.groupNickName;
                        break;
                    }
                }

                const content = message.Content.replace(/^(@[a-zA-Z0-9]+|[a-zA-Z0-9_-]+):<br\/>/, '');

                console.log("群消息：" + group);
                console.log("来自：" + group_member);
                console.log("消息：" + content);
            } else {
                let sender = null;
                for (let m of members) {
                    if (m.userName == message.FromUserName) {
                        sender = m.nickName;
                        break;
                    }
                }

                console.log("来自：" + sender);
                console.log("消息：" + message.Content);
            }
        }
    }
}

const getKeyWords = function () {
    try{
        const word = f.readFileSync('keyword.txt', 'utf-8');
        for (let w of word.split('\r\n')) {
            keyword.push(w);
        }
    }catch(e){
        console.log('没有找到keyword.txt');
    }
}

const run = async function () {
    getKeyWords();
    if (await wxinit()) {
        await notifyMobile();
        await lookupHost();
        await getContacts();
        await synccheck();

        updataContactTimer = setInterval(() => {
            getContacts();
        }, 1000 * 60 * 10);
    }
};

run();
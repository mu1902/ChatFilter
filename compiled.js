'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var request = require('request');
var qs = require('querystring');
var url = require('url');
var qr = require('qrcode-terminal');
var cheerio = require('cheerio');

var request_promise = function request_promise(option) {
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
};

var getUUID = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var para, request_option, res, data;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        para = {
                            appid: 'wx782c26e4c19acffb',
                            fun: 'new',
                            lang: 'zh_CN',
                            _: +new Date()
                        };
                        request_option = {
                            url: "https://login.weixin.qq.com/jslogin",
                            method: "POST",
                            formData: para
                        };
                        _context.next = 4;
                        return request_promise(request_option);

                    case 4:
                        res = _context.sent;

                        if (!res) {
                            _context.next = 11;
                            break;
                        }

                        data = qs.parse(res, '; ', ' = ');

                        if (!(data['window.QRLogin.code'] == '200')) {
                            _context.next = 9;
                            break;
                        }

                        return _context.abrupt('return', data['window.QRLogin.uuid'].slice(1, -2));

                    case 9:
                        _context.next = 12;
                        break;

                    case 11:
                        return _context.abrupt('return', res);

                    case 12:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getUUID() {
        return _ref.apply(this, arguments);
    };
}();

var checkLogin = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(id) {
        var para, request_option, res, data;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        para = {
                            loginicon: true,
                            tip: 0,
                            uuid: id,
                            _: +new Date(),
                            r: ~new Date()
                        };
                        request_option = {
                            url: "https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login",
                            method: "GET",
                            qs: para
                        };
                        _context2.next = 4;
                        return request_promise(request_option);

                    case 4:
                        res = _context2.sent;

                        if (!res) {
                            _context2.next = 10;
                            break;
                        }

                        data = qs.parse(res, ';', '=');
                        return _context2.abrupt('return', data);

                    case 10:
                        return _context2.abrupt('return', res);

                    case 11:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function checkLogin(_x) {
        return _ref2.apply(this, arguments);
    };
}();

var getTicket = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(url) {
        var request_option, res;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        request_option = {
                            url: url,
                            method: "GET"
                        };
                        _context3.next = 3;
                        return request_promise(request_option);

                    case 3:
                        res = _context3.sent;

                        if (!res) {
                            _context3.next = 8;
                            break;
                        }

                        return _context3.abrupt('return', res);

                    case 8:
                        return _context3.abrupt('return', res);

                    case 9:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function getTicket(_x2) {
        return _ref3.apply(this, arguments);
    };
}();

var baseRequest = {
    Skey: '',
    Sid: '',
    Uin: '',
    DeviceID: 'e' + Math.random().toFixed(15).toString().substring(2, 17)
};
var me = void 0,
    members = void 0,
    groups = void 0;
var redirect_uri = void 0,
    pass_ticket = void 0,
    sync_key = void 0,
    sync_key_format = void 0;
var checkSyncTimer = void 0,
    updataContactTimer = void 0;
var HOST_LIST = ["webpush.weixin.qq.com", "webpush.wx2.qq.com", "webpush.wx8.qq.com", "webpush.wx.qq.com", "webpush.web2.wechat.com", "webpush.web.wechat.com"];

var init = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        var uuid, loginState, ticket, $ticket;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return getUUID();

                    case 2:
                        uuid = _context4.sent;

                        if (!(uuid == null)) {
                            _context4.next = 8;
                            break;
                        }

                        console.log("获取UUID失败");
                        return _context4.abrupt('return', false);

                    case 8:
                        console.log("扫码登录");

                    case 9:
                        qr.generate("https://login.weixin.qq.com/l/" + uuid);

                    case 10:
                        if (!true) {
                            _context4.next = 27;
                            break;
                        }

                        _context4.next = 13;
                        return checkLogin(uuid);

                    case 13:
                        loginState = _context4.sent;

                        if (!(loginState["window.code"] == '200')) {
                            _context4.next = 18;
                            break;
                        }

                        console.log("确认登录");
                        redirect_uri = loginState["\nwindow.redirect_uri"].slice(1, -1);
                        return _context4.abrupt('break', 27);

                    case 18:
                        if (!(loginState["window.code"] == '201')) {
                            _context4.next = 21;
                            break;
                        }

                        console.log("扫描成功");
                        return _context4.abrupt('continue', 10);

                    case 21:
                        if (!(loginState["window.code"] == '408')) {
                            _context4.next = 25;
                            break;
                        }

                        console.log("登录超时");
                        init();
                        return _context4.abrupt('return', false);

                    case 25:
                        _context4.next = 10;
                        break;

                    case 27:
                        _context4.next = 29;
                        return getTicket(redirect_uri + '&fun=new');

                    case 29:
                        ticket = _context4.sent;
                        $ticket = cheerio.load(ticket);

                        pass_ticket = $ticket('pass_ticket').text();
                        baseRequest.Skey = $ticket('skey').text();
                        baseRequest.Sid = $ticket('wxsid').text();
                        baseRequest.Uin = $ticket('wxuin').text();

                        return _context4.abrupt('return', true);

                    case 36:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function init() {
        return _ref4.apply(this, arguments);
    };
}();

var wxinit = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        var para, request_option, res;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return init();

                    case 2:
                        if (!_context5.sent) {
                            _context5.next = 15;
                            break;
                        }

                        //console.log(baseRequest);
                        //console.log("pass_ticket => " + pass_ticket);
                        //console.log("redirect_uri => " + redirect_uri);
                        para = {
                            r: ~new Date(),
                            lang: 'zh_CN',
                            pass_ticket: pass_ticket
                        };
                        request_option = {
                            url: "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit",
                            method: "POST",
                            qs: para,
                            body: JSON.stringify({ BaseRequest: baseRequest })

                        };
                        _context5.next = 7;
                        return request_promise(request_option);

                    case 7:
                        res = _context5.sent;

                        me = JSON.parse(res).User;
                        sync_key = JSON.parse(res).SyncKey;
                        sync_key_format = sync_key.List.map(function (item) {
                            return item.Key + '_' + item.Val;
                        }).join('|');
                        //console.log(me);
                        //console.log("sync_key => " + sync_key_format);
                        console.log("微信初始化成功");
                        return _context5.abrupt('return', true);

                    case 15:
                        return _context5.abrupt('return', false);

                    case 16:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function wxinit() {
        return _ref5.apply(this, arguments);
    };
}();

var getContacts = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
        var para, request_option, res;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        para = {
                            lang: 'zh-CN',
                            pass_ticket: pass_ticket,
                            skey: baseRequest.Skey,
                            seq: 0,
                            r: +new Date()
                        };
                        request_option = {
                            url: "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact",
                            method: "POST",
                            qs: para,
                            json: true
                        };
                        _context6.next = 4;
                        return request_promise(request_option);

                    case 4:
                        res = _context6.sent;


                        members = [];
                        groups = {};
                        res.MemberList.forEach(function (member) {
                            if (!member.UserName.includes('@@')) {
                                members.push({ userName: member.UserName, nickName: member.NickName });
                            }
                        });

                        //console.log(members);

                    case 8:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function getContacts() {
        return _ref6.apply(this, arguments);
    };
}();

var getGroupMembers = function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(gs) {
        var para, body, request_option, res, data;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        para = {
                            type: "ex",
                            r: +new Date()
                        };
                        body = {
                            BaseRequest: baseRequest,
                            Count: gs.length,
                            List: gs.map(function (group) {
                                return { UserName: group.groupName, EncryChatRoomId: '' };
                            })
                        };
                        request_option = {
                            url: "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxbatchgetcontact",
                            method: "POST",
                            qs: para,
                            body: JSON.stringify(body)
                        };
                        _context7.next = 5;
                        return request_promise(request_option);

                    case 5:
                        res = _context7.sent;
                        data = JSON.parse(res);


                        data.ContactList.forEach(function (group) {
                            if (!groups[group.UserName]) {
                                groups[group.UserName] = [];
                            }
                            group.MemberList.forEach(function (member) {
                                groups[group.UserName].push({
                                    userName: member.UserName,
                                    userNickName: member.NickName,
                                    groupNickName: group.NickName
                                });
                            });
                        });

                        // console.log(groups);

                    case 8:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function getGroupMembers(_x3) {
        return _ref7.apply(this, arguments);
    };
}();

var notifyMobile = function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
        var para, body, request_option, res, data;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        para = {
                            lang: 'zh_CN',
                            pass_ticket: pass_ticket
                        };
                        body = {
                            BaseRequest: baseRequest,
                            Code: 3,
                            FromUserName: me.UserName,
                            ToUserName: me.UserName,
                            ClientMsgId: +new Date()
                        };
                        request_option = {
                            url: "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxstatusnotify",
                            method: "POST",
                            qs: para,
                            body: JSON.stringify(body)
                        };
                        _context8.next = 5;
                        return request_promise(request_option);

                    case 5:
                        res = _context8.sent;
                        data = JSON.parse(res);

                        if (data.BaseResponse.Ret == 0) {
                            console.log("通知客户端成功");
                        }

                    case 8:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));

    return function notifyMobile() {
        return _ref8.apply(this, arguments);
    };
}();

var lookupHost = function () {
    var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, h, para, request_option, res;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context9.prev = 3;
                        _iterator = HOST_LIST[Symbol.iterator]();

                    case 5:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context9.next = 15;
                            break;
                        }

                        h = _step.value;
                        para = {
                            r: +new Date(),
                            skey: baseRequest.Skey,
                            sid: baseRequest.Sid,
                            uin: baseRequest.Uin,
                            deviceid: baseRequest.DeviceID,
                            synckey: sync_key_format,
                            _: +new Date()
                        };
                        request_option = {
                            url: "https://" + h + "/cgi-bin/mmwebwx-bin/synccheck",
                            method: "GET",
                            qs: para
                        };
                        _context9.next = 11;
                        return request_promise(request_option);

                    case 11:
                        res = _context9.sent;

                    case 12:
                        _iteratorNormalCompletion = true;
                        _context9.next = 5;
                        break;

                    case 15:
                        _context9.next = 21;
                        break;

                    case 17:
                        _context9.prev = 17;
                        _context9.t0 = _context9['catch'](3);
                        _didIteratorError = true;
                        _iteratorError = _context9.t0;

                    case 21:
                        _context9.prev = 21;
                        _context9.prev = 22;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 24:
                        _context9.prev = 24;

                        if (!_didIteratorError) {
                            _context9.next = 27;
                            break;
                        }

                        throw _iteratorError;

                    case 27:
                        return _context9.finish(24);

                    case 28:
                        return _context9.finish(21);

                    case 29:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this, [[3, 17, 21, 29], [22,, 24, 28]]);
    }));

    return function lookupHost() {
        return _ref9.apply(this, arguments);
    };
}();

var synccheck = function () {
    var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
        var para, host, request_option, res, retcode, selector;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        para = {
                            r: +new Date(),
                            skey: baseRequest.Skey,
                            sid: baseRequest.Sid,
                            uin: baseRequest.Uin,
                            deviceid: baseRequest.DeviceID,
                            synckey: sync_key_format,
                            _: +new Date()
                        };
                        host = url.parse(redirect_uri).host;
                        request_option = {
                            url: "https://" + host + "/cgi-bin/mmwebwx-bin/synccheck",
                            method: "GET",
                            qs: para
                        };
                        _context10.next = 5;
                        return request_promise(request_option);

                    case 5:
                        res = _context10.sent;
                        retcode = res.match(/retcode:"(\d+)"/)[1];
                        selector = res.match(/selector:"(\d+)"/)[1];


                        clearTimeout(checkSyncTimer);

                        if (!(retcode != '0')) {
                            _context10.next = 13;
                            break;
                        }

                        _context10.next = 12;
                        return wxinit();

                    case 12:
                        return _context10.abrupt('return', false);

                    case 13:
                        if (!(selector == '2')) {
                            _context10.next = 16;
                            break;
                        }

                        _context10.next = 16;
                        return wxsync();

                    case 16:

                        //console.log([retcode, selector]);

                        checkSyncTimer = setTimeout(function () {
                            synccheck();
                        }, 3e3);

                    case 17:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this);
    }));

    return function synccheck() {
        return _ref10.apply(this, arguments);
    };
}();

var wxsync = function () {
    var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
        var para, body, request_option, res, messages;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        para = {
                            sid: baseRequest.Sid,
                            skey: baseRequest.Skey,
                            pass_ticket: pass_ticket
                        };
                        body = {
                            BaseRequest: baseRequest,
                            SyncKey: sync_key,
                            rr: ~new Date()
                        };
                        request_option = {
                            url: "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsync",
                            method: "POST",
                            qs: para,
                            body: JSON.stringify(body)
                        };
                        _context11.next = 5;
                        return request_promise(request_option);

                    case 5:
                        res = _context11.sent;
                        messages = JSON.parse(res).AddMsgList;

                        sync_key = JSON.parse(res).SyncKey;
                        sync_key_format = sync_key.List.map(function (item) {
                            return item.Key + '_' + item.Val;
                        }).join('|');
                        // for (let m of messages) {
                        //     if (m.MsgType != 51) {
                        //         console.log([m.MsgType, m.FromUserName, m.Content]);
                        //     }
                        // }
                        _context11.next = 11;
                        return messageHandle(messages);

                    case 11:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    }));

    return function wxsync() {
        return _ref11.apply(this, arguments);
    };
}();

var messageHandle = function () {
    var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(messages) {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, message, userId, group, group_member, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, gm, content, sender, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, m;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context12.prev = 3;
                        _iterator2 = messages[Symbol.iterator]();

                    case 5:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context12.next = 81;
                            break;
                        }

                        message = _step2.value;

                        if (!(message.MsgType == 1 && message.FromUserName != me.UserName)) {
                            _context12.next = 78;
                            break;
                        }

                        if (!message.FromUserName.includes('@@')) {
                            _context12.next = 48;
                            break;
                        }

                        userId = message.Content.match(/^(@[a-zA-Z0-9]+|[a-zA-Z0-9_-]+):<br\/>/)[1];
                        group = void 0, group_member = null;

                        if (groups[message.FromUserName]) {
                            _context12.next = 14;
                            break;
                        }

                        _context12.next = 14;
                        return getGroupMembers([{ groupName: message.FromUserName }]);

                    case 14:
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        _context12.prev = 17;
                        _iterator3 = groups[message.FromUserName][Symbol.iterator]();

                    case 19:
                        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                            _context12.next = 28;
                            break;
                        }

                        gm = _step3.value;

                        if (!(gm.userName == userId)) {
                            _context12.next = 25;
                            break;
                        }

                        group_member = gm.userNickName;
                        group = gm.groupNickName;
                        return _context12.abrupt('break', 28);

                    case 25:
                        _iteratorNormalCompletion3 = true;
                        _context12.next = 19;
                        break;

                    case 28:
                        _context12.next = 34;
                        break;

                    case 30:
                        _context12.prev = 30;
                        _context12.t0 = _context12['catch'](17);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context12.t0;

                    case 34:
                        _context12.prev = 34;
                        _context12.prev = 35;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 37:
                        _context12.prev = 37;

                        if (!_didIteratorError3) {
                            _context12.next = 40;
                            break;
                        }

                        throw _iteratorError3;

                    case 40:
                        return _context12.finish(37);

                    case 41:
                        return _context12.finish(34);

                    case 42:
                        content = message.Content.replace(/^(@[a-zA-Z0-9]+|[a-zA-Z0-9_-]+):<br\/>/, '');


                        console.log("群消息：" + group);
                        console.log("来自：" + group_member);
                        console.log("消息：" + content);
                        _context12.next = 78;
                        break;

                    case 48:
                        sender = null;
                        _iteratorNormalCompletion4 = true;
                        _didIteratorError4 = false;
                        _iteratorError4 = undefined;
                        _context12.prev = 52;
                        _iterator4 = members[Symbol.iterator]();

                    case 54:
                        if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                            _context12.next = 62;
                            break;
                        }

                        m = _step4.value;

                        if (!(m.userName == message.FromUserName)) {
                            _context12.next = 59;
                            break;
                        }

                        sender = m.nickName;
                        return _context12.abrupt('break', 62);

                    case 59:
                        _iteratorNormalCompletion4 = true;
                        _context12.next = 54;
                        break;

                    case 62:
                        _context12.next = 68;
                        break;

                    case 64:
                        _context12.prev = 64;
                        _context12.t1 = _context12['catch'](52);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context12.t1;

                    case 68:
                        _context12.prev = 68;
                        _context12.prev = 69;

                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }

                    case 71:
                        _context12.prev = 71;

                        if (!_didIteratorError4) {
                            _context12.next = 74;
                            break;
                        }

                        throw _iteratorError4;

                    case 74:
                        return _context12.finish(71);

                    case 75:
                        return _context12.finish(68);

                    case 76:

                        console.log("来自：" + sender);
                        console.log("消息：" + message.Content);

                    case 78:
                        _iteratorNormalCompletion2 = true;
                        _context12.next = 5;
                        break;

                    case 81:
                        _context12.next = 87;
                        break;

                    case 83:
                        _context12.prev = 83;
                        _context12.t2 = _context12['catch'](3);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context12.t2;

                    case 87:
                        _context12.prev = 87;
                        _context12.prev = 88;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 90:
                        _context12.prev = 90;

                        if (!_didIteratorError2) {
                            _context12.next = 93;
                            break;
                        }

                        throw _iteratorError2;

                    case 93:
                        return _context12.finish(90);

                    case 94:
                        return _context12.finish(87);

                    case 95:
                    case 'end':
                        return _context12.stop();
                }
            }
        }, _callee12, this, [[3, 83, 87, 95], [17, 30, 34, 42], [35,, 37, 41], [52, 64, 68, 76], [69,, 71, 75], [88,, 90, 94]]);
    }));

    return function messageHandle(_x4) {
        return _ref12.apply(this, arguments);
    };
}();

var run = function () {
    var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13() {
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        _context13.next = 2;
                        return wxinit();

                    case 2:
                        if (!_context13.sent) {
                            _context13.next = 12;
                            break;
                        }

                        _context13.next = 5;
                        return notifyMobile();

                    case 5:
                        _context13.next = 7;
                        return lookupHost();

                    case 7:
                        _context13.next = 9;
                        return getContacts();

                    case 9:
                        _context13.next = 11;
                        return synccheck();

                    case 11:

                        updataContactTimer = setInterval(function () {
                            getContacts();
                        }, 1000 * 60 * 10);

                    case 12:
                    case 'end':
                        return _context13.stop();
                }
            }
        }, _callee13, this);
    }));

    return function run() {
        return _ref13.apply(this, arguments);
    };
}();

run();

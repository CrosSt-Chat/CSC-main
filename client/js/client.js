function removeStoredInfo() {
  localStorage.setItem('saved-stats', 'no-saved');
  localStorage.removeItem('saved-nick');
  localStorage.removeItem('saved-trip');
  localStorage.removeItem('saved-key');
}

// function to join channel
function getNickToJoin(channel) {
  removeStoredInfo();
  input = window.prompt('请设置一个昵称：');
  if (!input) {
    return false;
  }

  if (input.search('#') == -1) {
    send({cmd: 'join', channel, nick: input, clientName});
    myNick = input;
    accountStr = input;
  } else {
    input = input.split('#', 2);
    send({cmd: 'join', channel, nick: input[0], password: input[1], clientName});
    myNick = input[0];
  }
  return true;
}

function notify(args) {
  if (localStorageGet("sound-switch") == "true") {
    var soundPromise = document.getElementById("notify-sound").play();
    if (soundPromise) {
      soundPromise.catch(function (error) {
        console.error("Problem playing sound:\n" + error);
      });
    }
  }
}

function getHomepage() {
  
  ws = new WebSocket( wsAddress );

  ws.onerror = function () {
    pushMessage({ text: "# dx_xb\n连接聊天室服务器失败，请稍候重试。\n**如果这个问题持续出现，请立刻联系 mail@henrize.kim 感谢您的理解和支持**", nick: '!'});
  }

  var reqSent = false;

  ws.onopen = function () {
    if (!reqSent) {
      send({ cmd: 'getinfo' });
      reqSent = true;
    }
    return;
  }

  ws.onmessage = function (message) {
    var args = JSON.parse(message.data);
    if (args.ver == undefined) {
      args.ver = "获取失败";
      args.online = "获取失败";
    }
    var homeText = "# 十字街\n##### " + args.ver + " 在线人数：" + args.online + "\n-----\n欢迎来到十字街，这是一个简洁轻小的聊天室网站。\n第一次来十字街？来 **[公共聊天室](/?公共聊天室)** 看看吧！\n你也可以创建自己的聊天室。\n站长邮箱：mail@henrize.kim\n十字街源码：[github.com/CrosSt-Chat/CSC-main](https://github.com/CrosSt-Chat/CSC-main/)\n**感谢 [Chiro](https://www.chiro.work/) 无偿为十字街提供的服务器！**\n-----\n在使用本网站时，您应当遵守中华人民共和国的有关规定。\n如果您不在中国大陆范围内居住，您还应当同时遵守当地的法律规定。\nCrosSt.Chat Dev Team - 2020/02/29\nHave a nice chat!";    pushMessage({ text: homeText });
  }
}

function join(channel) {
  
  ws = new WebSocket( wsAddress );

  ws.onerror = function () {
    pushMessage({ text: "# dx_xb\n连接聊天室服务器失败，请稍候重试。\n**如果这个问题持续出现，请立刻联系 mail@henrize.kim 感谢您的理解和支持**", nick: '!'});
  }

  var wasConnected = false;

  ws.onopen = function () {
    // 已保存用户信息，并且存在 trip
    if (localStorage.getItem('saved-stats') == 'ok-with-trip') {
      // 读取用户信息
      myNick = localStorage.getItem('saved-nick');
      let trip = localStorage.getItem('saved-trip');
      let key = localStorage.getItem('saved-key');

      accountStr = '[' + trip + '] ' + myNick;

      // 如果是自动登录
      if (localStorage.getItem('auto-login') == 'true') {
        // 自动登录
        send({cmd: 'join', channel, nick: myNick, trip, key, clientName});
        wasConnected = true;
        return;
      } else {
        // 弹出确认框
        if (window.confirm('以上次的昵称登入聊天室？\n' + accountStr)) {
          send({cmd: 'join', channel, nick: myNick, trip, key, clientName});
          wasConnected = true;
          return;
        } else {
          wasConnected = getNickToJoin(channel);
          return;
        }
      }
    }

    // 已保存用户信息，但是没有 trip
    if (localStorage.getItem('saved-stats') == 'ok-without-trip') {
      // 读取用户信息
      myNick = localStorage.getItem('saved-nick');

      accountStr = myNick;

      // 如果是自动登录
      if (localStorage.getItem('auto-login') == 'true') {
        // 自动登录
        send({cmd: 'join', channel, nick: myNick, clientName});
        wasConnected = true;
        return;
      } else {
        // 弹出确认框
        if (window.confirm('以上次的昵称登入聊天室？\n' + accountStr)) {
          send({cmd: 'join', channel, nick: myNick, clientName});
          wasConnected = true;
          return;
        } else {
          wasConnected = getNickToJoin(channel);
          return;
        }
      }
    }

    // 剩下的情况，都是没有保存用户信息的
    wasConnected = getNickToJoin(channel);
  }

  ws.onclose = function () {
    if (wasConnected) {
      pushMessage({ nick: '!', text: "与服务器的连接已断开，请刷新重试。" });
    }
  }

  ws.onmessage = function (message) {
    var args = JSON.parse(message.data);
    var cmd = args.cmd;
    var command = COMMANDS[cmd];
    command.call(null, args);
  }
}

var COMMANDS = {
  chat: function (args) {
    pushMessage(args);
  },

  info: function (args) {
    args.nick = '*';
    pushMessage(args);
  },

  warn: function (args) {
    args.nick = '!';
    pushMessage(args);
  },

  onlineSet: function (args) {
    var nicks = args.nicks;

    usersClear();

    nicks.forEach(function (nick) {
      userAdd(nick);
    });

    userAdd(myNick);
    nicks.push(myNick);

    // 保证昵称不会被解析成 Markdown
    nicks = nicks.map(function (nick) {
      return escapeMarkdown(nick);
    });

    if (typeof args.trip == 'string' && typeof args.key == 'string') {
      accountStr = '[' + args.trip + '] ' + myNick;
      document.getElementById('account-name').innerText = accountStr;
      
      // 保存用户信息
      localStorage.setItem('saved-stats', 'ok-with-trip');
      localStorage.setItem('saved-trip', args.trip);
      localStorage.setItem('saved-key', args.key);
    } else {
      document.getElementById('account-name').innerText = accountStr;
    }

    localStorage.setItem('saved-nick', myNick);
    if (localStorage.getItem('saved-stats') != 'ok-with-trip') {
      localStorage.setItem('saved-stats', 'ok-without-trip');
      localStorage.removeItem('saved-trip');
      localStorage.removeItem('saved-key');
    }

    document.getElementById('version-text').innerText = args.ver;

    pushMessage({ nick: '*', text: '在线的用户：' + nicks.join(", ")})
  },

  onlineAdd: function (args) {
    if (args.nick != myNick){
      userAdd(args.nick);

      if ($('#joined-left').checked) {
        if (args.client == 'null') {
          pushMessage({
            nick: '*',
            trip: args.trip,
            type: 'join',
            text: escapeMarkdown(args.nick) + " 加入聊天室"
          });
        } else {
          pushMessage({
            nick: '*',
            trip: args.trip,
            type: 'join',
            text: escapeMarkdown(args.nick) + " 加入聊天室\n###### 来自 " + args.client
          });
        }
      }
    }
  },

  onlineRemove: function (args) {
    userRemove(args.nick);

    if ($('#joined-left').checked) {
      pushMessage({ nick: '*', text: escapeMarkdown(args.nick) + " 离开聊天室" });
    }
  },

  infoInvalid: function (args) {
    removeStoredInfo();
    args.nick = '!';
    args.text = '账号信息验证失败，请重新填写昵称。';
    pushMessage(args);
    localStorageSet('auto-login', 'false');
  },

  html: function (args) {
    if ( allowHTML ) {
      pushHTML(args);
    } else {
      pushMessage({
        nick: '*',
        text: args.nick + ' 发送了一条HTML消息，但由于您的设置并未显示，您可以打开侧边栏接收HTML消息'
      });
    }
  }
}

function send(data) {
  if (ws && ws.readyState == ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

/* main */

updateInputSize();

if (!myChannel) {
  getHomepage();
  $('#footer').classList.add('hidden');
  $('#sidebar').classList.add('hidden');
} else {
  join(myChannel);
}

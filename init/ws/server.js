// 负责查找 socket、对 socket 发送消息、广播消息等操作

export async function run(hazel, core, hold) {
  // 向指定的 socket 发送消息
  core.reply = function (payload, socket) {
    try {
      if (socket.readyState === 1 /* OPEN */) {
        socket.send(JSON.stringify(payload));
      }
    } catch (error) {
      hazel.emit('error', error, socket);
    }
  }

  // 寻找符合条件的 socket
  // 本函数高度来源于 https://github.com/hack-chat/main/blob/master/server/src/serverLib/MainServer.js#L353
  // 功能太强一般用不到，先注释掉
  /*
  core.hackchatFindSockets = function (filter) {
    const filterAttrs = Object.keys(filter);
    const reqCount = filterAttrs.length;
    let curMatch = 0;
    let matches = [];
    hold.wsServer.clients.forEach((socket) => {
      curMatch = 0;
      for (let loop = 0; loop < reqCount; loop += 1) {
        let filterAttrValue = filter[filterAttrs[loop]];
        if (typeof socket[filterAttrValue] !== 'undefined') {
          switch (typeof filter[filterAttrValue]) {
            // 这里暂时删除根据数组匹配的功能
            case 'object': {
              if (Array.isArray(filter[filterAttrs[loop]])) {
                if (filter[filterAttrs[loop]].indexOf(socket[filterAttrs[loop]]) !== -1) {
                  curMatch += 1;
                }
              } else if (socket[filterAttrs[loop]] === filter[filterAttrs[loop]]) {
                curMatch += 1;
              }
              break;
            }

            case 'function': {
              if (filter[filterAttrValue](socket[filterAttrValue])) {
                curMatch += 1;
              }
              break;
            }

            default: {
              if (socket[filterAttrValue] === filter[filterAttrValue]) {
                curMatch += 1;
              }
              break;
            }
          }
        }
      }

      if (curMatch === reqCount) {
        matches.push(socket);
      }
    });

    return matches;
  }
  */

  // 使用属性为字符串的过滤条件查找 socket
  core.findSocket = function (filter) {
    let attrCount = Object.keys(filter).length;
    let curMatch = 0;
    let matches = [];
    hold.wsServer.clients.forEach((socket) => {
      curMatch = 0;
      for (let attr in filter) {
        if (socket[attr] === filter[attr]) {
          curMatch += 1;
        }
      }

      if (curMatch === attrCount) {
        matches.push(socket);
      }
    });
    return matches;
  }

  // 使用一个属性作为过滤条件查找 socket
  core.findSocketTiny = function (attr, value) {
    let matches = [];
    hold.wsServer.clients.forEach((socket) => {
      if (socket[attr] === value) {
        matches.push(socket);
      }
    });
    return matches;
  }

  // 根据给定的用户等级查找 socket
  core.findSocketByLevel = function (level) {
    let matches = [];
    hold.wsServer.clients.forEach((socket) => {
      if (socket.level >= level) {
        matches.push(socket);
      }
    });
    return matches;
  }

  // 向指定的一些 socket 广播消息
  core.broadcast = function (payload, sockets) {
    sockets.forEach((socket) => {
      try {
        if (socket.readyState === 1 /* OPEN */) {
          socket.send(JSON.stringify(payload));
        }
      } catch (error) {
        hazel.emit('error', error, socket);
      }
    });
  }
}

export const priority = 32;

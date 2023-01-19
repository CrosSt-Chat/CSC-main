export async function run(hazel, core, hold) {
  core.handleData = async function (socket, data) {
    // 检查该地址是否请求频率过高或在 CIDR 禁止列表中
    if (core.checkAddress(socket.remoteAddress, 1) || socket.isDeniedIP) {
      // 防止在短时间内发送大量数据时程序占用过高，直接回复处理好的警告消息
      socket.send('{"cmd":"warn","code":"RATE_LIMITED","text":"您的操作过于频繁或被全域封禁，如果您对此有任何疑问，请联系 mail@henrize.kim 。"}');
      return;
    };

    // 将消息转换为字符串
    data = data.toString('utf8');

    // 检测消息长度，不符合要求则忽略
    if (data.length > core.config.dataMaximumLength || data.length < 1) { return; }

    // 将消息转换为 JSON 对象
    try {
      data = JSON.parse(data);
    } catch (error) {
      // 按照惯例，如果消息不是 JSON 格式，则关闭连接
      socket.terminate();
      return;
    }
    if (typeof data !== 'object') {
      socket.terminate();
      return;
    }

    // JSON 对象中每个属性都必须是字符串
    // 且属性名不应该是 __proto__  porototype constructor
    // 否则关闭连接
    for (const key in data) {
      if (typeof data[key] !== 'string' || key === '__proto__' || key === 'prototype' || key === 'constructor') {
        socket.terminate();
        return;
      }
    }

    if (!data.cmd) { return; } // 消息必须有 cmd 属性

    // 直接从 hazel 中拿命令
    let command = hazel.loadedFunctions.get(data.cmd);

    // 如果命令不存在，或者不公开，提示命令不存在
    if (typeof command == 'undefined') {
      core.replyUnknownCommand(socket);
      return;
    }

    if (!command.moduleType === 'ws-command') {
      core.replyUnknownCommand(socket);
      return;
    }

    // 检查该客户端是否有权限运行该命令
    if (command.requiredLevel > socket.level) {
      core.replyUnknownCommand(socket);
      return;
    }

    // 检查命令的参数是否齐全
    if (command.requiredData.length > 0) {
      for (let attr of command.requiredData) {
        if (typeof data[attr] == 'undefined') {
          core.replyUnknownCommand(socket);
          return;
        }
      }
    }

    // 运行命令
    try {
      await command.run(hazel, core, hold, socket, data);
    } catch (error) {
      hazel.emit('error', error, socket);
    }

    // 计入全局频率
    core.increaseGlobalRate();
  }
}

export const priority = 32;

// 用于处理新的 WebSocket 连接

export async function run( hazel, core, hold, socket, request) {
  /* 前置检查 */
  // 获取客户端地址
  if (hazel.mainConfig.behindReverseProxy) {
    socket.remoteAddress = request.getHeader('x-forwarded-for');
  } else {
    socket.remoteAddress = request.connection.remoteAddress;
  }

  // 去掉 IPv6 地址的前缀
  if (socket.remoteAddress.startsWith('::ffff:')) {
    socket.remoteAddress = socket.remoteAddress.slice( 7 );
  }

  // 检查该地址是否请求频率过高
  if (core.checkAddress(socket.remoteAddress, 10)) {
    // 如果是直接关闭连接
    socket.terminate();
    return;
  };

  /* 绑定 WebSocket 事件 */
  // message 事件
  socket.on('message', function (message) {
    // 检查该地址是否请求频率过高
    if (core.checkAddress(socket.remoteAddress, 1)) {
      // 防止在短时间内发送大量数据时程序占用过高，直接回复处理好的警告消息
      socket.send('{"cmd":"warn","warn":"您的操作过于频繁或被全域封禁，如果您对此有任何疑问，请联系 mail@henrize.kim 。"}');
      return;
    };

    // 将消息转换为字符串
    message = message.toString('utf8');

    // 检测消息长度，不符合要求则忽略
    if (message.length > core.config.dataMaximumLength || message.length < 1) { return; }

    // 将消息转换为 JSON 对象
    try {
      message = JSON.parse(message);
    } catch (error) {
      // 按照惯例，如果消息不是 JSON 格式，则关闭连接
      socket.terminate();
      return;
    }
    if (typeof message !== 'object') {
      socket.terminate();
      return;
    }

    // JSON 对象中每个属性都必须是字符串
    // 且属性名不应该是 __proto__  porototype constructor
    // 否则关闭连接
    for (const key in message) {
      if (typeof message[key] !== 'string' || key === '__proto__' || key === 'prototype' || key === 'constructor') {
        socket.terminate();
        return;
      }
    }

    if (!message.cmd) { return; } // 消息必须有 cmd 属性
    
    // 如果用户没有加入任何聊天室，且不是加入聊天室前允许执行的命令，则忽略
    let allowedCommandsBoforeJoin = ['join', 'info', 'ping'];
    if (typeof socket.channel === 'undefined' && !allowedCommandsBoforeJoin.includes(message.cmd)) { return; }

    // 尝试运行命令
    core.execCommand(socket, message);

    // 计入全局频率
    core.increaseGlobalRate();
  });

  // close 事件
  socket.on('close', function () {
    // 如果用户加入了聊天室，则从聊天室中移除
    if (typeof socket.channel !== 'undefined') {
      // to-do: 移除用户
    }
  });

  // error 事件
  socket.on('error', (error) => { hazel.emit('error', error, socket); });

  /* 结束部分 */
  // hold.wsServer._server._connections 为当前连接数

  // 计入全局频率
  core.increaseGlobalRate();
}

export const moduleType = 'system';
export const name = 'handle-connection';

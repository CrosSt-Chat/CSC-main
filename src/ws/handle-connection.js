// 用于处理新的 WebSocket 连接

export async function run( hazel, core, hold, socket, request) {
  /* 前置检查 */
  // 获取客户端地址
  if (hazel.mainConfig.behindReverseProxy) {
    socket.remoteAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    // 十字街现在不用 CDN 所以不用这个玩意
    // socket.remoteAddress = request.headers['x-forwarded-for'].split(',').pop().trim() || request.connection.remoteAddress;
  } else {
    socket.remoteAddress = request.connection.remoteAddress;
  }

  // 去掉 IPv6 地址的前缀
  if (socket.remoteAddress.startsWith('::ffff:')) {
    socket.remoteAddress = socket.remoteAddress.slice( 7 );
  }

  // 检查该地址是否请求频率过高
  if (core.checkAddress(socket.remoteAddress, 3)) {
    socket.send('{"cmd":"warn","code":"RATE_LIMITED","text":"您的操作过于频繁，请稍后再试。"}');
    // 关闭连接
    socket.terminate();
    return;
  };

  // 检查该地址的 CIDR 是否在允许 / 禁止列表中
  [socket.isAllowedIP, socket.isDeniedIP] = core.checkIP(socket.remoteAddress);

  // 检查该地址是否在封禁列表中
  if (hold.bannedIPlist.includes(socket.remoteAddress) || socket.isDeniedIP) {
    socket.send('{"cmd":"warn","code":"BANNED","text":"您已经被全域封禁，如果您对此有任何疑问，请联系 mail@henrize.kim 。"}');
    // 关闭连接
    socket.terminate();
    return;
  }

  /* 绑定 WebSocket 事件 */
  // message 事件
  socket.on('message', (message) => { core.handleData(socket, message); });

  // close 事件
  socket.on('close', function () {
    // 如果用户加入了聊天室，则从聊天室中移除
    if (typeof socket.channel !== 'undefined') {
      core.removeSocket(socket);
    }
  });

  // error 事件
  socket.on('error', (error) => { hazel.emit('error', error, socket); });

  /* 结束部分 */
  // 记录日志
  // core.log(core.LOG_LEVEL.DEBUG, ['New connection from', socket.remoteAddress, 'isAllowedIP:', socket.isAllowedIP, 'isDeniedIP:', socket.isDeniedIP]);

  // 计入全局频率
  core.increaseGlobalRate();
}

export const name = 'handle-connection';
export const moduleType = 'system';

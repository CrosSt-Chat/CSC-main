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
  if (core.checkAddress( socket.remoteAddress, 10)) {
    // 如果是直接关闭连接
    socket.terminate();
    return;
  };

  /* 绑定 WebSocket 事件 */
  // message 事件
  socket.on('message', function (message) {
    console.log(message.toString('utf8'));
    core.increaseGlobalRate();
  });

  // 计入全局频率
  core.increaseGlobalRate();
}

export const moduleType = 'system';
export const name = 'handle-connection';

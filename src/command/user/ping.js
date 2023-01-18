// 回复 pong 表示服务器正常运行
export async function run(hazel, core, hold, socket, payload) {
  // 回复 pong
  core.send({ cmd: 'pong' }, socket);

  // 频率限制器计数
  core.checkAddress(socket.remoteAddress, 5);

  // 计入全局频率
  core.increaseGlobalRate();
}

export const moduleType = 'ws-command';
export const name = 'ping';

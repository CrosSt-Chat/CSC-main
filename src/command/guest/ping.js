// 回复 pong 表示服务器正常运行
export async function run(hazel, core, hold, socket, data) {
  // 回复 pong
  core.reply({ cmd: 'pong' }, socket);

  // 频率限制器计数
  core.checkAddress(socket.remoteAddress, 5);
}

export const name = 'ping';
export const requiredLevel = 0;
export const requiredData = [];
export const moduleType = 'ws-command';

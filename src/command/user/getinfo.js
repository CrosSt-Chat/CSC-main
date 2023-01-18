// 现在的用途是：在首页显示服务器信息
// 之后大概率会被废弃
export async function run(hazel, core, hold, socket, payload) {
  // 频率限制器计数
  core.checkAddress(socket.remoteAddress, 6);

  // 回复客户端简易的服务器信息
  core.send({
    cmd: 'setinfo',
    ver: core.config.version,
    online: hold.wsServer._server._connections,
  }, socket);

  // 因为访问一次首页就会触发一次 getinfo
  // 所以使用这个命令的数量约等于首页访问量
  core.increaseState('homepage-visit');

  // 写入存档
  core.archive('VHP', null, socket.remoteAddress);

  // 计入全局频率
  core.increaseGlobalRate();
}

export const moduleType = 'ws-command';
export const requiredData = [];
export const name = 'getinfo';

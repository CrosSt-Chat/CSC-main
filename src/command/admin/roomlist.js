// 返回房间以及房间内的用户列表
export async function run(hazel, core, hold, socket, data) {
  let result = '';

  // 遍历 hold.channel
  hold.channel.forEach(({ socketList }, name) => {
    // 添加一行结果
    result += `?${name}: `;
  
    socketList.forEach((socket) => {
      // 遍历房间内的用户
      if (typeof socket.trip == 'string') {
        // 如果用户有 trip，添加 trip
        result += `[${socket.trip}]${socket.nick} `;
      } else {
        // 如果用户没有 trip，只添加用户名
        result += `${socket.nick} `;
      }
    });

    // 添加换行符
    result += '\n';
  });

  // 回复结果
  core.replyInfo('ROOMLIST', result, socket);
}

// 通过 /roomlist 命令返回房间以及房间内的用户列表
export async function execByChat(hazel, core, hold, socket, line) {
  await run(hazel, core, hold, socket);
}

export const name = 'roomlist';
export const requiredLevel = 4;
export const requiredData = [];
export const moduleType = 'ws-command';

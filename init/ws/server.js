// 负责查找 socket、对 socket 发送消息、广播消息等操作

export async function run(hazel, core, hold) {
  // 向指定的 socket 发送消息
  core.send = function (socket, payload) {
    if (typeof payload !== 'object') { return; }
    
    try {
      if (socket.readyState === 1/* OPEN */) {
        socket.send(JSON.stringify(payload));
      }
    } catch (error) {
      hazel.emit('error', error, socket);
    }
  }
}

export const priority = 32;

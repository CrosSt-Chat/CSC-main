// 定时 ping 每个客户端，以保持连接
export async function run(hazel, core, hold) {
  hold.wsServer.clients.forEach((socket) => {
    if (socket.readyState == 1/* OPEN */) {
      socket.ping();
    }
  });
}

export const moduleType = 'system';
export const name = 'beatheart';

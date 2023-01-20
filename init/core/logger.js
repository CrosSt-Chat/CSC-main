// 日志记录器
import { writeFileSync } from 'fs';

export async function run(hazel, core, hold) {
  // 日志级别
  core.LOG_LEVEL = {
    DEBUG: 0,
    LOG: 1,
    WARN: 2,
    ERROR: 3
  };

  // 记录技术性日志 
  core.log = function (level, content) {
    if (level >= core.config.logLevel) {
      // 如果要求写入的日志级别高于设定的日志级别，写入日志
      // 如果 content 是数组，转为字符串
      if (Array.isArray(content)) {
        content = content.join(' ');
      } else if (typeof content == 'object') {
        content = JSON.stringify(content);
      }

      if (level == core.LOG_LEVEL.DEBUG) {
        content = '[DEBUG] ' + content;
      } else if (level == core.LOG_LEVEL.LOG) {
        content = '[LOG] ' + content;
      } else if (level == core.LOG_LEVEL.WARNING) {
        content = '[WARN] ' + content;
      } else if (level == core.LOG_LEVEL.ERROR) {
        content = '[ERROR] ' + content;
      }

      // 写入日志
      try {
        writeFileSync(hazel.mainConfig.logDir + '/' + core.getDateString() + '.log.txt',
          core.getTimeString() + content + '\n',
          { encoding: 'utf-8', flag: 'a' }
        );
      } catch (error) {
        hazel.emit('error', error);
      }
    }
  };

  // 记录聊天和操作记录存档
  core.archive = function (logType, socket, logText) {
    // 生成日志内容
    let content = core.getTimeString() + logType + ' ';
    if (socket) {
      if (typeof socket.trip == 'string') {
        content += socket.channel + ' [' + socket.trip + ']' + socket.nick + ': ' + logText;
      } else { 
        content += socket.channel + ' []' + socket.nick + ': ' + logText;
      }
    } else {
      content += logText;
    }

    // 替换 content 中的换行
    content = content.replace(/\n/g, '\\n');
    content = content.replace(/\r/g, '\\r');
    content += '\n';

    // 写入日志
    try {
      writeFileSync(hazel.mainConfig.logDir + '/' + core.getDateString() + '.archive.txt',
        content,
        { encoding: 'utf-8', flag: 'a' }
      );
    } catch (error) {
      hazel.emit('error', error);
    }
  };
}

export const priority = 2;

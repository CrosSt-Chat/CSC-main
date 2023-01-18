// 日志记录器

import { writeFileSync } from 'fs';

// 获取就像 [20:42:13] 一样的时间字符串
function getTimeString() {
  let timeNow = new Date();
  let hour = timeNow.getHours();
  let min = timeNow.getMinutes();
  let sec = timeNow.getSeconds();
  if (hour < 10) {
    hour = '0' + hour;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (sec < 10) {
    sec = '0' + sec;
  }
  return '[' + hour + ':' + min + ':' + sec + ']';
}

// 获取就像 21-06-18 一样的日期字符串
function getDateString() {
  let timeNow = new Date();
  return (timeNow.getFullYear() - 2000) + '-' + (timeNow.getMonth() + 1) + '-' + timeNow.getDate();
}

export async function run(hazel, core, hold) {
  /*  日志级别
    const logLevel = {
      debug: 0,
      info: 1,
      log: 2,
      warn: 3,
    }
  */
  core.log = function (level, type, content) {
    if (level >= core.dConfig.logLevel) {
      // 如果要求写入的日志级别高于设定的日志级别，写入日志
      if (typeof content == 'object') {
        // 如果 content 是数组，转为字符串
        content = content.join(' ')
      }

      // 写入日志
      try {
        writeFileSync(hazel.mainConfig.logDir + '/log-' + getDateString() + '.log.txt',
          getTimeString() + type + ' ' + content + '\n',
          { encoding: 'utf-8', flag: 'a' }
        );
      } catch (error) {
        hazel.emit('error', error);
      }
    }
  }
}

export const priority = 2;

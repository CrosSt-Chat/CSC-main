// 各种不知道在哪能用到的工具函数

export async function run( hazel, core, hold ) {
  // 净化对象以防止原型链污染
  core.purifyObject = function ( input ) {
    let output = Object.create( null );
    for ( let objectKey in input ) {
      if ( objectKey != '__proto__' && objectKey != 'constructor' && objectKey != 'prototype' ) {
        output[ objectKey ] = input[ objectKey ];
      }
    }
    return output;
  }

  // 从数组中删除指定元素
  core.removeFromArray = function ( array, element ) {
    let index = array.indexOf( element );
    if ( index > -1 ) {
      array.splice( index, 1 );
      return true;
    } else {
      return false;
    }
  }

  // 获取就像 [20:42:13] 一样的时间字符串
  core.getTimeString = function () {
    let timeNow = new Date();
    let hour = timeNow.getHours();
    let min = timeNow.getMinutes();
    let sec = timeNow.getSeconds();
    if (hour < 10) { hour = '0' + hour; }
    if (min < 10) { min = '0' + min; }
    if (sec < 10) { sec = '0' + sec; }
    return '[' + hour + ':' + min + ':' + sec + ']';
  }

  // 获取就像 21-06-18 一样的日期字符串
  core.getDateString = function () {
    let timeNow = new Date();
    return (timeNow.getFullYear() - 2000) + '-' + (timeNow.getMonth() + 1) + '-' + timeNow.getDate();
  }
}

export const priority = 0

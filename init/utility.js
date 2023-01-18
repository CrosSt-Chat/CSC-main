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
}

export const priority = 1

// 用于检查一个 IPv4 地址是否在指定的 CIDR 范围内

import { readFileSync } from 'fs';
import { join } from 'path';

// 检查 IPv4 地址是否在允许的 CIDR 列表中
function isInList(ipFirst, ipBinary, CIDRlist) {
  // 如果 CIDR 列表中没有 IPv4 地址的第一段对应的数组，则返回 false
  if (CIDRlist[ipFirst] == undefined) { return false; }

  // 遍历 CIDR 列表中 IPv4 地址的第一段对应的数组
  for (let item of CIDRlist[ipFirst]) {
    // 如果 IPv4 地址的后三段二进制数与 CIDR 列表中的二进制数相同，则返回 true
    if (ipBinary.startsWith(item)) {
      return true;
    }
  }

  // 否则返回 false
  return false;
}

// 解析 CIDR 字符串
function parseCIDRstring(item) {
  // 拆分 CIDR 字符串
  let [ip, mask] = item.split('/');

  // 将掩码转换为整数
  mask = parseInt(mask);

  // 拆分 IPv4 地址
  ip = ip.split('.');

  // 将 IPv4 地址的后三段转换为二进制数
  let ipBinary = '';
  ip.forEach((item, index) => {
    if (index == 0) {
      return;
    }
    ipBinary += parseInt(item).toString(2).padStart(8, '0');
  });

  // 返回如下内容
  // IPv4 地址的第一段
  // 经过裁剪后的后三段二进制数
  return {
    ipFirst: parseInt(ip[0]),
    ipBinary: ipBinary.slice(0, (mask - 8))
  }
}

export async function run(hazel, core, hold) {
  let IPV4_REGEXP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  let CIDR_REGEXP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:3[0-2]|[12]?[0-9])$/;

  // 读取允许的 CIDR 列表
  core.loadAllowCIDR = function() {
    let rawCIDRlist;
    try {
      rawCIDRlist = readFileSync(join(hazel.mainConfig.baseDir, hazel.mainConfig.allowCIDRlistDir), {encoding: 'utf-8'});
    } catch (error) {
      hazel.emit('error', error);
    }

    // 清空之前的 CIDR 列表
    hold.allowCIDRlist = [];

    // 读取允许的 CIDR 列表
    rawCIDRlist = rawCIDRlist.split('\n');

    // 对每一个 CIDR 值进行处理
    for ( let item of rawCIDRlist ) {
      // 忽略文件中的注释
      if (item.startsWith('#')) {
        continue;
      }

      // 去除空行
      if (item == '') {
        continue;
      }

      // 解析 CIDR 字符串
      let CIDR = parseCIDRstring( item );

      // 将解析后的 CIDR 字符串添加到 CIDR 列表中
      if ( typeof hold.allowCIDRlist[CIDR.ipFirst] == 'undefined') {
        hold.allowCIDRlist[CIDR.ipFirst] = [];
      }
      hold.allowCIDRlist[CIDR.ipFirst].push( CIDR.ipBinary );
    }
  }

  // 检查 IPv4 地址是否在某个 CIDR 列表中
  core.checkIP = function(ip) {
    // 检查是否是一个 IPv4 地址
    if (!IPV4_REGEXP.test(ip)) { return false; }

    // 拆分 IPv4 地址
    ip = ip.split('.');

    // 获取 IPv4 地址的第一段
    let ipFirst = parseInt(ip[0]);

    // 将 IPv4 地址的后三段转换为二进制数
    let ipBinary = '';

    ipBinary += parseInt(ip[1]).toString(2).padStart(8, '0');
    ipBinary += parseInt(ip[2]).toString(2).padStart(8, '0');
    ipBinary += parseInt(ip[3]).toString(2).padStart(8, '0');

    return [
      isInList(ipFirst, ipBinary, hold.allowCIDRlist),
      isInList(ipFirst, ipBinary, hold.denyCIDRlist)
    ];
  }

  core.allowCIDR = function(item) {
    // 检查是否是一个 CIDR 字符串
    if (!CIDR_REGEXP.test(item)) { return false; }

    // 解析 CIDR 字符串
    let CIDR = parseCIDRstring(item);

    // 将解析后的 CIDR 字符串添加到 CIDR 列表中
    if (typeof hold.allowCIDRlist[CIDR.ipFirst] == 'undefined') {
      hold.allowCIDRlist[CIDR.ipFirst] = [];
    }
    hold.allowCIDRlist[CIDR.ipFirst].push(CIDR.ipBinary);

    return true;
  }

  core.denyCIDR = function (item) {
    // 检查是否是一个 CIDR 字符串
    if (!CIDR_REGEXP.test(item)) { return false; }

    // 解析 CIDR 字符串
    let CIDR = parseCIDRstring(item);

    // 将解析后的 CIDR 字符串添加到 CIDR 列表中
    if (typeof hold.denyCIDRlist[CIDR.ipFirst] == 'undefined') {
      hold.denyCIDRlist[CIDR.ipFirst] = [];
    }
    hold.denyCIDRlist[CIDR.ipFirst].push(CIDR.ipBinary);

    return true;
  }
}

export const priority = 16;

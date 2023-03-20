// WebSocket 连接地址
var wsAddress = 'ws://127.0.0.1:2764/';
// var wsAddress = 'wss://ws.crosst.chat:35197/';

// 客户端信息
var clientName = '[十字街网页版](https://crosst.chat/)';
var clientVersion = '20230100';
var localStorageVersion = '1';

// 连接信息
var ws;
var myNick = '';
var myChannel = decodeURI(window.location.search.replace(/^\?/, ''));
var accountStr;

var lastSent = [''];
var lastSentPos = 0;

var allowHTML = false;

// Markdown 渲染器
var md = new Remarkable('full', {
  html: false,
  xhtmlOut: false,
  breaks: true,
  langPrefix: 'language-',
  linkify: true,
  linkTarget: '_blank" rel="noreferrer',
  typographer:  false,
  quotes: '""\'\'',

  // highlight.js 代码高亮引擎
  doHighlight: true,
  highlight: (str, lang) => {
    if (!window.hljs) { return ''; }

    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (_) {}
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (_) {}

    return '';
  }
});

// 是否允许显示图片相关的逻辑
// 是否允许显示图片
var allowImages = true;
var imgHostWhitelist = [
  'i.loli.net', 's2.loli.net',					// sm.ms
  's1.ax1x.com', 's2.ax1x.com', 'z3.ax1x.com', 's4.ax1x.com',     // imgchr.com
  'i.postimg.cc',
  'bed-1254016670.cos.ap-guangzhou.myqcloud.com',
  'mrpig.eu.org'
];

function getDomain(link) {
  var a = document.createElement('a');
  a.href = link;
  return a.hostname;
}

function isWhiteListed(link) {
  return imgHostWhitelist.indexOf(getDomain(link)) !== -1;
}

md.renderer.rules.image = function (tokens, idx, options) {
  var src = Remarkable.utils.escapeHtml(tokens[idx].src);

  if (isWhiteListed(src) && allowImages || getDomain(src) == 'crosst.chat') {
    var imgSrc = ' src="' + Remarkable.utils.escapeHtml(tokens[idx].src) + '"';
    var title = tokens[idx].title ? (' title="' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(tokens[idx].title)) + '"') : '';
    var alt = ' alt="' + (tokens[idx].alt ? Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(Remarkable.utils.unescapeMd(tokens[idx].alt))) : '') + '"';
    var suffix = options.xhtmlOut ? ' /' : '';
    var scrollOnload = isAtBottom() ? ' onload="window.scrollTo(0, document.body.scrollHeight)"' : '';
    return '<a href="' + src + '" target="_blank" rel="noreferrer"><img' + scrollOnload + imgSrc + alt + title + suffix + '></a>';
  }

  return '<a href="' + src + '" target="_blank" rel="noreferrer">' + Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(src)) + '</a>';
};

md.renderer.rules.text = function(tokens, idx) {
  tokens[idx].content = Remarkable.utils.escapeHtml(tokens[idx].content);

  if (tokens[idx].content.indexOf('?') !== -1) {
    tokens[idx].content = tokens[idx].content.replace(/(^|\s)(\?)\S+?(?=[,.!?:)]?\s|$)/gm, function(match) {
      var channelLink = Remarkable.utils.escapeHtml(Remarkable.utils.replaceEntities(match.trim()));
      var whiteSpace = '';
      if (match[0] !== '?') {
        whiteSpace = match[0];
      }
      return whiteSpace + '<a href="' + channelLink + '" target="_blank">' + channelLink + '</a>';
    });
  }

  return tokens[idx].content;
};

// 用于保证某内容不被解析为 Markdown
function escapeMarkdown(text) {
  return text.replace(/([*_~`+])/g, '\\$1');
}

// 一句话 jQuery
var $ = document.querySelector.bind(document);

function localStorageGet(key) {
  try {
    return localStorage[key];
  } catch (e) { }
}

function localStorageSet(key, val) {
  try {
    localStorage[key] = val;
  } catch (e) { }
}

// 设置网站图标
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  $('link[rel="icon"]').href = 'https://ws.crosst.chat:21563/icon/icon-light.ico';
} else {
  $('link[rel="icon"]').href = 'https://ws.crosst.chat:21563/icon/icon-dark.ico';
}

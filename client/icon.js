if ( window.matchMedia('(prefers-color-scheme: dark)').matches ) {
  document.querySelector('link[rel="icon"]').href = 'https://ws.crosst.chat:21563/icon/icon-light.ico';
} else {
  document.querySelector('link[rel="icon"]').href = 'https://ws.crosst.chat:21563/icon/icon-dark.ico';
}

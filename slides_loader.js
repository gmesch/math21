function writeScript(url, opts) {
  opts = opts || {};
  document.write('<script src="' + url + '"' + (opts.async ? ' async' : '') + '></script>');
}

function writeLink(url, rel) {
  document.write('<link href="' + url + '" rel="' + rel + '">');
}

if (document.location.protocol == 'file:' &&
    document.location.search.indexOf('force-cdn') == -1) {
  writeScript('mathjax/tex-mml-chtml.js', {async: true});
  writeLink('fonts/fonts.css', 'stylesheet');

} else {
  writeScript('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js', {async: true});
  writeLink('https://fonts.gstatic.com', 'preconnect');
  writeLink('https://fonts.googleapis.com/css2' +
            '?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900' +
            '&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700' +
            '&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700' +
            '&family=Oswald:wght@400;700&display=swap', 'stylesheet');
}

writeScript('https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js');
writeScript('https://www.gstatic.com/firebasejs/8.3.1/firebase-messaging.js');

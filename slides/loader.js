function writeScript(url, opts) {
  opts = opts || {};
  document.write('<script src="' + url + '"' + (opts.async ? ' async' : '') + '></script>');
}

function writeLink(url, rel) {
  document.write('<link href="' + url + '" rel="' + rel + '">');
}

writeScript('slides/jslib.js');
writeScript('slides/state.js');
writeScript('slides/state_util.js');
writeScript('slides/slides.js');

writeLink('slides/slides.css', 'stylesheet');
writeLink('slides/style.css', 'stylesheet');

writeScript('slides/mathjax.js');
writeScript('slides/firebase.js');
writeScript('slides/canvas.js');

writeScript('https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js');
writeScript('https://www.gstatic.com/firebasejs/8.3.1/firebase-messaging.js');

if (document.location.protocol == 'file:' &&
    document.location.search.indexOf('force-cdn') == -1) {
  writeScript('slides/vnd/prettify/run_prettify.js?autorun=false&lang=scm', {async: true});
  writeScript('slides/vnd/mathjax/es5/tex-mml-chtml.js', {async: true});
  writeLink('slides/vnd/fonts/fonts.css', 'stylesheet');

} else {
  writeScript('https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js?autorun=false&lang=scm',
            {async: true});
  writeScript('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js', {async: true});
  writeLink('https://fonts.gstatic.com', 'preconnect');
  writeLink('https://fonts.googleapis.com/css2' +
            '?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900' +
            '&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700' +
            '&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700' +
            '&family=Oswald:wght@400;700&display=swap', 'stylesheet');
}

function init() {
  initslides();

  preAdjust();
  PR.prettyPrint();
  
  console.log('slides init done');
}

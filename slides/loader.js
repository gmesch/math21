function writeScript(url, opts) {
  opts = opts || {};
  document.write('<script src="' + url + '"' + (opts.async ? ' async' : '') + '></script>');
}

function writeLink(url, rel) {
  document.write('<link href="' + url + '" rel="' + rel + '">');
}

const scripts = document.getElementsByTagName('script');
const thisScript = scripts[scripts.length - 1];
const base = thisScript.getAttribute('src').replace('loader.js', '');

writeScript(base + 'jslib.js');
writeScript(base + 'state.js');
writeScript(base + 'state_util.js');
writeScript(base + 'slides.js');

writeLink(base + 'slides.css', 'stylesheet');
writeLink(base + 'style.css', 'stylesheet');

writeScript(base + 'mathjax.js');
writeScript(base + 'firebase.js');
writeScript(base + 'canvas.js');

writeScript('https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js');
writeScript('https://www.gstatic.com/firebasejs/8.3.1/firebase-messaging.js');

if (document.location.protocol == 'file:' &&
    document.location.search.indexOf('force-cdn') == -1) {
  writeScript(base + 'vnd/prettify/run_prettify.js?autorun=false&lang=scm', {async: true});
  writeScript(base + 'vnd/mathjax/es5/tex-mml-chtml.js', {async: true});
  writeLink(base + 'vnd/fonts/fonts.css', 'stylesheet');

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

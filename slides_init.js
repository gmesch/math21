function init() {
  initslides();

  preAdjust();
  PR.prettyPrint();

  const params = State.decode(window.location.search.substr(1));
  if (params['follow']) {
    initFirebaseFollow(params['follow']);
  }

  if (params['lead']) {
    initFirebaseLead(params['lead']);
  }
  
  console.log('slides init done');
}

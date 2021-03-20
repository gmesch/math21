/**
 * The Slides object manages the slide show. The function initslides() that sets
 * up the Slides instance, and a few more helper functions used by Slides.  
 */

function initslides() {
  const navElement = $('navigator');
  const slidesElement = $('slides');
  const s = new Slides(navElement, slidesElement);

  const canvasElement = $('canvas');
  const c = new Canvas(canvasElement);
  // Must be here, lest canvas size gets set to 0.
  d0('bgpage');

  const slidekeys = makeSlideKeyHandler(s);
  const mapkeys = makeCanvasKeyHandler(c);

  // In Safari and Chrome, keypress doesn't fire for cursor keys. So
  // use keydown.
  window.document.addEventListener('keydown', slidekeys, false);
  window.document.addEventListener('keydown', mapkeys, false);
  window.document.addEventListener('keyup', mapkeys, false);

  let touchStartX = -1;
  let touchStartY = -1;
  window.document.body.addEventListener('touchstart', function(event) {
    touchStartX = event.touches[0].screenX;
    touchStartY = event.touches[0].screenY;
  });

  window.document.body.addEventListener('touchend', function(event) {
    const deltaX = event.touches[0].screenX - touchStartX;
    const deltaY = event.touches[0].screenY - touchStartY;

    // NOTE(mesch): Doesn't work.
    
    if (deltaX > 100 && Math.abs(deltaY) < 100) {
      slides.nextStep();

    } else if (deltaX < -100 && Math.abs(deltaY) < 100) {
      slides.backStep();

    } else if (deltaY > 100 && Math.abs(deltaX) < 100) {
      slides.backStep();

    } else if (deltaY < -100 && Math.abs(deltaX) < 100) {
      slides.nextStep();
    }

    touchStartX = -1;
    touchStartY = -1;
  });
}


function makeSlideKeyHandler(slides) {
  return function(event) {
    const key = event.keyCode;
    console.log(key);

    if (key == 39) {
      // right
      if (event.shiftKey) {
        slides.nextSlide();
      } else {
        slides.nextStep();
      }        

    } else if (key == 37) {
      // left
      if (event.shiftKey) {
        slides.backSlide();
      } else {
        slides.backStep();
      }

    } else if (key == 38) {
      // up
      slides.backStep();

    } else if (key == 40) {
      // down
      slides.nextStep();

    } else if (key == 32) {
      // space
      slides.nextStep();

    } else if (key == 13) {
      // enter
      slides.nextStep();

    } else if (key == 76) {
      // link - L
      slides.linkSlide();

    } else if (key == 78) {
      // notes - N
      slides.toggleNotes();
    }
  };
}


function makeCanvasKeyHandler(c) {
  const elements = [
    'header',
    'footer'
  ];

  return function(event) {
    const key = event.which || event.keyCode;
    if (key == 49 && event.type == 'keydown') {
      if (!c.getShown()) {
        d0(...elements);
        d1('bgpage');
        c.setShown(true);
      } else {
        d1(...elements);
        d0('bgpage');
        c.setShown(false);
      }
    }
  };
}


function Slides(navElement, slidesElement) {
  this.slidesElement_ = slidesElement;

  /**
   * An array of information about all slides. The elements of this array are
   * tuples with the following fields:
   * 
   * 0) a DOM node that is the entry in the navigator for the slide,
   * 
   * 1) a DOM node that is the slide itself,
   * 
   * 2) the number of steps on the slide,
   *
   */
  this.slides_ = [];

  /**
   * The index of the currently active slide, or -1 as during
   * initialization while there is no active slide yet.
   * @type Number
   */
  this.slide_ = -1;

  /**
   * A map from symbolic slide names to slide numbers.
   * @type {Object}
   */
  this.slidesByName_ = {};

  /**
   * A map from slide numbers to symbolic slide names.
   * @type {Object}
   */
  this.slidesByNumber_ = {};

  /**
   * The number of build steps in the current slide.
   * @type {Number}
   */
  this.steps_ = 0;

  /**
   * The currently activ build step in the current slide.
   * @type {Number}
   */
  this.step_ = 0;

  /**
   * A map of the step reached in each slide. We can navigate away from a slide
   * while not yet on the last build step, and when coming back to that slide,
   * the last reached, rather than the last, build step will be assumed again.
   * @type {Object}
   */
  this.stepBySlide_ = {};
  
  for (var c = slidesElement.firstChild; c; c = c.nextSibling) {
    if (!domTestClass(c, 'slide')) {
      continue;
    }
    
    const slide = c;
    const handle = create('div');
    const group = slide.getAttribute('group');
    if (group) {
      handle.className = group;
    }
    navElement.appendChild(handle);
    this.slides_.push([handle, slide, this.getNumSteps_(slide)]);

    const h1 = slide.getElementsByTagName('H1')[0];
    if (h1) {
      handle.title = h1.innerHTML;
    }

    const name = slide.getAttribute('name');
    if (name) {
      const num = this.slides_.length - 1;
      this.slidesByName_[name] = num;
      this.slidesByNumber_[num] = name;
    }
  }

  navElement.onclick = bind(this, this.navclick_);

  /**
   * The State manager object that handles browser history and
   * bookmarks.
   */
  this.state_ = new State;
  this.state_.dominate('slide', 'step');
  this.state_.init(bind(this, this.updateState_));
}


Slides.prototype.toggleNotes = function() {
  if (domTestClass(this.slidesElement_, 'display-notes')) {
    domRemoveClass(this.slidesElement_, 'display-notes');
  } else {
    domAddClass(this.slidesElement_, 'display-notes');
  }
};


Slides.prototype.updateState_ = function(param) {
  const slide = param['slide'];
  const step = param['step'];
  this.setActiveStep_(this.slidesByName_[slide] || slide || 0,
                      step || 0);
};


Slides.prototype.navclick_ = function(event) {
  const src = event.target || event.srcElement;
  const slideIndex = this.getSlideIndexFromNavNode_(src);
  if (slideIndex !== null) {
    this.setActiveStep_(slideIndex, this.stepBySlide_[slideIndex] || 0);
  }
};


const STEP_REACHED = -1;
const STEP_NEXT = -2;
const STEP_PREV = -3;
const STEP_FIRST = -4;
const STEP_LAST = -5;

const SLIDE_CURRENT = -1;
const SLIDE_NEXT = -2;
const SLIDE_PREV = -3;

Slides.prototype.nextSlide = function() {
  if (this.slide_ < this.slides_.length - 1) {
    this.setActiveStep_(SLIDE_NEXT, STEP_REACHED);
  }
};


Slides.prototype.backSlide = function() {
  if (this.slide_ > 0) {
    this.setActiveStep_(SLIDE_PREV, STEP_REACHED);
  }
};


Slides.prototype.linkSlide = function() {
  const targetIndex = this.getCurrentStepLink_();
  if (targetIndex !== null) {
    this.setActiveStep_(targetIndex, STEP_FIRST);
  }
};


Slides.prototype.nextStep = function() {
  if (this.step_ < this.steps_ - 1) {
    this.setActiveStep_(SLIDE_CURRENT, STEP_NEXT);
  } else {
    this.setActiveStep_(SLIDE_NEXT, STEP_FIRST);
  }
};


Slides.prototype.backStep = function() {
  if (this.step_ > 0) {
    this.setActiveStep_(SLIDE_CURRENT, STEP_PREV);
  } else {
    this.setActiveStep_(SLIDE_PREV, STEP_LAST);
  }
};


Slides.prototype.getCurrentStepLink_ = function() {
  const slideElement = this.getSlideElement_(this.slide_);
  const stepElements = this.getStepElements_(slideElement, this.step_);

  if (!stepElements || stepElements.length == 0) {
    return null;
  }

  for (const stepElement of stepElements) {
    const link = stepElement.getAttribute('link');
    if (!link) {
      continue;
    }

    if (!(link in this.slidesByName_)) {
      return null;
    }
    
    return this.slidesByName_[link];
  }
  
  return null;
}

Slides.prototype.getSlideIndexFromNavNode_ = function(navNode) {
  for (let i = 0; i < this.slides_.length; ++i) {
    if (this.slides_[i] == navNode) {
      return i;
    }
  }
  return null;
};


Slides.prototype.getSlideElement_ = function(slideNumber) {
  if (slideNumber >= 0 && slideNumber < this.slides_.length) {
    return this.slides_[slideNumber][1];
  } else {
    return null;
  }
};


Slides.prototype.getStepElements_ = function(slideElement, stepNumber) {
  const stepElements = [];
  domTraverseElements(slideElement, function(node) {
    const stepAtt = node.getAttribute('step');
    if (!stepAtt) {
      return;
    }

    for (const step of stepAtt.split(',')) {
      if (Number(step) == stepNumber) {
        stepElements.push(node);
      }
    }
  });
  return stepElements;
}


Slides.prototype.processAttribute_ = function(slideElement, attributeName) {
  if (!slideElement) {
    return;
  }

  const attributeValue = slideElement.getAttribute(attributeName);
  if (attributeValue) {
    try {
      eval(attributeValue);
    } catch (e) {
      if (typeof console != 'undefined') {
        console.log(e);
      }
    }
  }
};


Slides.prototype.processFloater_ = function(slideElement, show) {
  if (!slideElement) {
    return;
  }
  
  var floater = slideElement.getAttribute('floater');
  if (!floater) {
    return;
  }
  
  showslides(!show);
  showfloat(floater, show);

  this.processAttribute_($(floater), show ? 'onshow' : 'onhide');
};


Slides.prototype.setActiveStep_ = function(slideIndex, stepIndex) {
  let targetSlide;
  if (slideIndex == SLIDE_CURRENT) {
    targetSlide = this.slide_;
  } else if (slideIndex == SLIDE_NEXT) {
    if (this.slide_ >= this.slides_.length - 1) {
      return;
    }
    targetSlide = this.slide_ + 1;
  } else if (slideIndex == SLIDE_PREV) {
    if (this.slide_ <= 0) {
      return;
    }
    targetSlide = this.slide_ - 1;
  } else {
    if (slideIndex < 0 ||
        slideIndex > this.slides_.length - 1) {
      return;
    }
    targetSlide = slideIndex;
  }
  
  if (this.slide_ != targetSlide) {
    this.processSlides_(targetSlide);
    this.steps_ = this.slides_[this.slide_][2];
    this.state_.recordState('slide', this.slidesByNumber_[this.slide_] || this.slide_, true);
  }
    
  if (stepIndex == STEP_REACHED) {
    if (this.slide_ in this.stepBySlide_) {
      this.step_ = this.stepBySlide_[this.slide_];
    } else {
      this.step_ = 0;
    }

  } else if (stepIndex == STEP_FIRST) {
    this.step_ = 0;

  } else if (stepIndex == STEP_LAST) {
    this.step_ = this.steps_ - 1;

  } else if (stepIndex == STEP_NEXT) {
    if (slideIndex == SLIDE_CURRENT &&
        this.step_ < this.steps_ - 1) {
      ++this.step_
    }
    
  } else if (stepIndex == STEP_PREV) {
    if (slideIndex == SLIDE_CURRENT &&
        this.step_ > 0) {
      --this.step_
    }
  } else {
    if (stepIndex >= 0 && stepIndex < this.steps_) {
      this.step_ = stepIndex;
    }
  }

  if (this.steps_ > 0) {
    this.processStep_();
    this.stepBySlide_[this.slide_] = this.step_;
    this.state_.recordState('step', this.step_, false);
  }
};

Slides.prototype.processSlides_ = function(slideIndex) {  
  const previousSlideElement = this.getSlideElement_(this.slide_);
  this.processAttribute_(previousSlideElement, 'onhide');
  this.processFloater_(previousSlideElement, false);

  for (let i = 0; i < this.slides_.length; ++i) {
    var navElement = this.slides_[i][0];
    var slideElement = this.slides_[i][1];
    if (i == slideIndex) {
      this.slide_ = i;
      slideElement.style.display = 'block';
      slideLoadIFrame(slideElement);
      domAddClass(navElement, 'active');
      
    } else {
      slideElement.style.display = 'none';
      domRemoveClass(navElement, 'active');
    }
  }

  const nextSlideElement = this.getSlideElement_(this.slide_);
  this.processAttribute_(nextSlideElement, 'onshow');
  this.processFloater_(nextSlideElement, true);
}

Slides.prototype.getNumSteps_ = function(slideElement) {
  if (!domTestClass(slideElement, 'build') &&
      !domTestClass(slideElement, 'build-visible') &&
      !domTestClass(slideElement, 'build-focus') &&
      !domTestClass(slideElement, 'build-focus-visible')) {
    return 0;
  }

  let stepMax = 0;
  domTraverseElements(slideElement, function(node) {
    const stepAtt = node.getAttribute('step');
    if (stepAtt) {
      for (const step of stepAtt.split(',')) {
        stepMax = Math.max(stepMax, Number(step));
      }
    }
  });

  return stepMax + 1;
};


Slides.prototype.processStep_ = function() {
  const slideElement = this.getSlideElement_(this.slide_);

  const build = domTestClass(slideElement, 'build');
  const build_visible = domTestClass(slideElement, 'build-visible');
  const build_focus = domTestClass(slideElement, 'build-focus');
  const build_focus_visible = domTestClass(slideElement, 'build-focus-visible');
  
  const focus = build_focus || build_focus_visible;
  const visible = build_visible || build_focus_visible;
  
  const step = this.step_;
  domTraverseElements(slideElement, function(node) {
    const stepAtt = node.getAttribute('step');
    if (!stepAtt) {
      return;
    }

    let built = false;
    for (const stepVal of stepAtt.split(',')) {
      const stepNum = Number(stepVal);
      if ((!focus && stepNum < step) || stepNum == step) {
        built = true;
      }
    }

    if (built) {
      if (visible) {
        node.style.filter = '';
      } else {
          node.style.visibility = '';
      }
    } else {
      if (visible) {
        node.style.filter = 'opacity(25%)';
        
      } else {
        node.style.visibility = 'hidden';
      }
    }
  });
};


function showslides(show) {
  const elements = [
    'slides',
    'shade',
    'header'
  ];

  (show ? d1 : d0).apply(null, elements);
}


function showfloat(id, show) {
  if (show) {
    $(id).style.display = 'block';
  } else {
    $(id).style.display = '';
  }
}


function slideLoadIFrame(slide) {
  const iframes = slide.getElementsByTagName('iframe');
  for (const iif of iframes) {
    slideCheckIframe(iif);
  }
}


function slideCheckIframe(element) {
  const s = element.getAttribute('xsrc');
  const w = element.contentWindow;
  try {
    // Will throw exception once external page is loaded here.
    if (w.location == 'about:blank') {
      w.location.replace(s);
      window.setTimeout(function() {
        $('navigator').focus();
      });
    }
  } catch (e) {}
}

/**
 * The Slides object manages the slide show. The function initslides() that sets
 * up the Slides instance, and a few more helper functions used by Slides.  
 */

function initslides() {
  const navElement = $('navigator');
  const slidesElement = $('slides');
  const s = new Slides(navElement, slidesElement);

  const slidekeys = makeSlideKeyHandler(s);
  const mapkeys = makeMapKeyHandler();

  // In Safari and Chrome, keypress doesn't fire for cursor keys. So
  // use keydown.
  window.document.addEventListener('keydown', slidekeys, false);
  window.document.addEventListener('keydown', mapkeys, false);
  window.document.addEventListener('keyup', mapkeys, false);
}


function makeSlideKeyHandler(slides) {
  return function(event) {
    const key = event.keyCode;
    console.log(key);
    if (key == 39) {
      // right
      slides.nextSlide();

    } else if (key == 37) {
      // left
      slides.backSlide();

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


function makeMapKeyHandler() {
  const elements = [
    'slides',
    'shade',
    'logo',
    'logo2'
  ];
  return function(event) {
    const key = event.which || event.keyCode;
    if (key == 49) {
      if (event.type == 'keydown') {
        d0(...elements);

      } else if (event.type == 'keyup') {
        d1(...elements);
      }
    }
  };
}


function Slides(navElement, slidesElement) {
  this.slidesElement_ = slidesElement;

  /**
   * An array of information about all slides. The elements of this
   * array are tuples of a DOM node that is the entry in the navigator
   * for the slide, and a DOM node that is the slide itself.
   * @type Array.<Array>
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
    this.slides_.push([handle, slide]);

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
  this.setActiveImpl_(this.slidesByName_[slide] || slide || 0,
                      step);
};


Slides.prototype.navclick_ = function(event) {
  const src = event.target || event.srcElement;
  this.setActive(src);
};


Slides.prototype.getCurrentStepLink_ = function() {
  const slideElement = this.getSlideElement_(this.slide_);
  const stepElement = this.getStepElement_(slideElement, this.step_);

  if (!stepElement) {
    return null;
  }

  const link = stepElement.getAttribute('link');
  if (!link) {
    return null;
  }

  if (!(link in this.slidesByName_)) {
    return null;
  }

  return this.slidesByName_[link];
}


Slides.prototype.nextSlide = function() {
  if (this.slide_ < this.slides_.length - 1) {
    this.setActive(this.slide_ + 1);
  }
};


Slides.prototype.backSlide = function() {
  if (this.slide_ > 0) {
    this.setActive(this.slide_ - 1);
  }
};


Slides.prototype.linkSlide = function() {
  const target = this.getCurrentStepLink_();
  if (target !== null) {
    this.setActive(target);
  }
};


Slides.prototype.nextStep = function() {
  if (this.step_ < this.steps_ - 1) {
    this.step_ += 1;
    this.processStep_();
  } else {
    this.nextSlide();
  }
};


Slides.prototype.backStep = function() {
  if (this.step_ > 0) {
    this.step_ -= 1;
    this.processStep_();
  } else {
    this.backSlide();
  }
};


Slides.prototype.setActive = function(a) {
  this.setActiveImpl_(a);
  this.state_.recordState(
    'slide',
    this.slidesByNumber_[this.slide_] || this.slide_,
    true);
};


Slides.prototype.setActiveImpl_ = function(a, opt_step) {
  const slideElement = this.getSlideElement_(this.slide_);
  this.processAttribute_(slideElement, 'onhide');
  this.processFloater_(slideElement, false);

  const previousActive = this.slide_;

  for (let i = 0; i < this.slides_.length; ++i) {
    var handle = this.slides_[i][0];
    var slide = this.slides_[i][1];
    if (slide == a || handle == a || i == a) {
      this.slide_ = i;
      slide.style.display = 'block';
      slideLoadIFrame(slide);
      domAddClass(handle, 'active');

    } else {
      slide.style.display = 'none';
      domRemoveClass(handle, 'active');
    }
  }

  const slideElement2 = this.getSlideElement_(this.slide_);
  this.processAttribute_(slideElement2, 'onshow');
  this.processFloater_(slideElement2, true);

  this.processSteps_(this.slide_, previousActive, opt_step);
};


Slides.prototype.getSlideElement_ = function(slideNumber) {
  if (slideNumber >= 0 && slideNumber < this.slides_.length) {
    return this.slides_[slideNumber][1];
  } else {
    return null;
  }
};


Slides.prototype.getStepElement_ = function(slideElement, stepNumber) {
  let stepElement = null;
  domTraverseElements(slideElement, function(node) {
    const step = node.getAttribute('step');
    if (!step) {
      return;
    }
    if (Number(step) == stepNumber) {
      stepElement = node;
    }
  });
  return stepElement;
}


Slides.prototype.processAttribute_ = function(slideElement, attributeName) {
  if (slideElement) {
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


Slides.prototype.processSteps_ = function(currentSlideNumber,
                                          previousSlideNumber, opt_step) {
  if (currentSlideNumber == previousSlideNumber) {
    return;
  }

  const slideElement = this.getSlideElement_(currentSlideNumber);
  if (!slideElement) {
    return;
  }

  if (!domTestClass(slideElement, 'build') &&
      !domTestClass(slideElement, 'build-visible') &&
      !domTestClass(slideElement, 'build-focus') &&
      !domTestClass(slideElement, 'build-focus-visible')) {
    this.steps_ = 0;
    this.step_ = 0;
    return;
  }

  let stepMax = 0;
  domTraverseElements(slideElement, function(node) {
    const stepAtt = node.getAttribute('step');
    if (stepAtt) {
      stepMax = Math.max(stepMax, Number(stepAtt));
    }
  });
  
  this.steps_ = stepMax + 1;
  if (opt_step != null) {
    this.step_ = Number(opt_step);
    
  } else if (currentSlideNumber in this.stepBySlide_) {
    this.step_ = this.stepBySlide_[currentSlideNumber];

  } else if (currentSlideNumber > previousSlideNumber) {
    this.step_ = 0;

  } else {
    this.step_ = this.steps_ - 1;
  }

  this.processStep_();
};


Slides.prototype.processStep_ = function() {
  this.state_.recordState('step', this.step_, false);
  this.stepBySlide_[this.slide_] = this.step_;

  const slideElement = this.getSlideElement_(this.slide_);
  if (!slideElement) {
    return;
  }

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

    const stepVal = Number(stepAtt);
    if ((!focus && stepVal < step) || stepVal == step) {
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

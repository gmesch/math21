class MessageDispatcher {
  constructor() {
    this.receivers_ = [];
  }

  receive(receiver) {
    this.receivers_.push(receiver);
  }

  send(data) {
    for (const receiver of this.receivers_) {
      receiver(data);
    }
  }
}

class Canvas {
  constructor(canvasElement) {
    this.msg_ = new MessageDispatcher;
    
    this.canvas_ = canvasElement;
    this.contextInit_();

    this.screens_ = [];
    this.screen_ = 0;
    this.curves_ = [];
    this.curve_ = null;

    this.isShown_ = false;
    this.mouseover_ = false;
    
    this.canvas_.addEventListener('mousedown', this.onMouseDown_.bind(this));
    this.canvas_.addEventListener('mouseup', this.onMouseUp_.bind(this));
    this.canvas_.addEventListener('mousemove', this.onMouseMove_.bind(this));
    this.canvas_.addEventListener('mouseover', this.onMouseOver_.bind(this));
    this.canvas_.addEventListener('mouseout', this.onMouseOut_.bind(this));

    document.body.addEventListener('keydown', this.onKeyDown_.bind(this));
    window.addEventListener('resize', this.onResize_.bind(this));
  }

  setScreen(index) {
    if (index == this.screen_) {
      return;
    }
    
    if (!this.screens_[index]) {
      this.screens_[index] = [];
    }

    this.curves_ = this.screens_[index];
    this.screen_ = index;
    
    if (this.isShown_) {
      this.draw_();
    }
  }
  
  contextInit_() {
    this.canvas_.width = this.canvas_.clientWidth;
    this.canvas_.height = this.canvas_.clientHeight;

    this.ctx_ = this.canvas_.getContext('2d');
    this.ctx_.lineWidth = 3;
    this.ctx_.lineCap = 'round';
    this.ctx_.lineJoin = 'round';
    this.ctx_.strokeStyle = 'orange';
  }

  onResize_() {
    const scale = this.canvas_.clientWidth / this.canvas_.width;
    for (const curves of this.screens_) {
      if (curves) {
        for (const curve of curves) {
          for (const point of curve) {
            point[0] *= scale;
            point[1] *= scale;
          }
        }
      }
    }
    
    this.contextInit_();
    this.draw_();
  }

  receive(handler) {
    this.msg_.receive(handler);
  }

  setShown(v) {
    if (this.isShown_ != v) {
      this.isShown_ = v;
      this.notifyShow_();
      if (this.isShown_) {
        this.draw_();
      }
    }
  }

  getShown() {
    return this.isShown_;
  }

  onMouseDown_(event) {
    this.curve_ = [];
  }

  onMouseUp_(event) {
    if (this.curve_.length > 0) {
      this.notifyNew_(this.curves_.length, this.curve_);
      this.curves_.push(this.curve_);
    }
    this.curve_ = null;
    this.draw_();
  }

  onMouseMove_(event) {
    if (this.curve_) {
      this.curve_.push([event.offsetX, event.offsetY]);
      this.draw_();
    }
  }

  onMouseOver_(event) {
    this.mouseover_ = true;
  }

  onMouseOut_(event) {
    this.mouseover_ = false;
  }

  onKeyDown_(event) {
    if (this.mouseover_) {
      if (event.keyCode == 8) {
        // delete
        if (this.curve_) {
          this.curve_.splice(0);
        } else {
          this.curves_.pop();
          this.notifyPop_(this.curves_.length);
        }
      }
      this.draw_();
    }
  }

  // TODO notify() could be generic, and just send a message with everything
  // changed since last call to it
  //
  // Then messages can contain more than one operation.

  notifyShow_() {
    this.msg_.send({
      op: 'show',
      show: this.isShown_
    });
  }
  
  notifyPop_(index) {
    this.msg_.send({
      op: 'pop',
      screen: this.screen_,
      index: index
    });
  }
  
  notifyNew_(index, curve) {
    this.msg_.send({
      op: 'new',
      screen: this.screen_,
      index: index,
      curve: curve,
      width: this.canvas_.width
    });
  }

  updateState(data) {
    if (data.op == 'show') {
      this.setShown(data.show);
    }

    if (data.op == 'new') {
      if (!this.screens_[data.screen]) {
        this.screens_[data.screen] = [];
      }
      const curves = this.screens_[data.screen];
      
      if (curves.length <= data.index) {
        const scale = this.canvas_.width / data.width;
        const curve = data.curve;
        for (const point of curve) {
          point[0] *= scale;
          point[1] *= scale;
        }
        
        curves.push(curve);
        if (this.isShown_ && this.screen_ == data.screen) {
          this.notifyNew_(data.index, curve);
          this.draw_();
        }
      }
    }

    if (data.op == 'pop') {
      if (this.screens_[data.screen]) {
        const curves = this.screens_[data.screen];
        if (data.index < curves.length) {
          curves.splice(data.index);
          if (this.isShown_ && this.screen_ == data.screen) {
            this.notifyPop_(data.index);
            this.draw_();
          }
        }
      }
    }
  }
  
  draw_() {
    this.ctx_.clearRect(0, 0, this.canvas_.clientWidth, this.canvas_.clientHeight);
    for (const curve of this.curves_) {
      this.drawOne_(curve);
    }
    if (this.curve_ && this.curve_.length > 0) {
      this.drawOne_(this.curve_);
    }
  };

  drawOne_(curve) {
    if (!curve) {
      return;
    }
    
    const ctx = this.ctx_;
    
    ctx.beginPath();
    ctx.moveTo(curve[0][0], curve[0][1]);
    for (let i = 1; i < curve.length; ++i) {
      ctx.lineTo(curve[i][0], curve[i][1]);
    }
    ctx.stroke();
  }
}

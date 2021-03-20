class Canvas {
  constructor(canvasElement) {
    this.canvas_ = canvasElement;
    this.canvas_.width = canvas.clientWidth;
    this.canvas_.height = canvas.clientHeight;

    this.ctx_ = canvas.getContext('2d');
    this.ctx_.lineWidth = 3;
    this.ctx_.lineCap = 'round';
    this.ctx_.lineJoin = 'round';
    this.ctx_.strokeStyle = 'orange';

    this.curves_ = [];
    this.curve_ = null;

    this.isShown_ = false;
    this.isDrawing_ = false;
    this.mouseover_ = false;
    
    canvas.addEventListener('mousedown', this.onMouseDown_.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp_.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove_.bind(this));
    canvas.addEventListener('mouseover', this.onMouseOver_.bind(this));
    canvas.addEventListener('mouseout', this.onMouseOut_.bind(this));
    document.body.addEventListener('keydown', this.onKeyDown_.bind(this));    
  }

  setShown(v) {
    this.isShown_ = v;
    if (this.isShown_) {
      this.draw_();
    }
  }

  getShown() {
    return this.isShown_;
  }

  onMouseDown_(event) {
    this.isDrawing_ = true;
    this.curve_ = [];
  }

  onMouseUp_(event) {
    this.isDrawing_ = false;
    if (this.curve_.length > 0) {
      this.curves_.push(this.curve_);
    }
    this.curve_ = null;
    this.draw_();
  }

  onMouseMove_(event) {
    if (this.isDrawing_) {
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
        }
      }
      this.draw_();
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
    const ctx = this.ctx_;
    
    ctx.beginPath();
    ctx.moveTo(curve[0][0], curve[0][1]);
    for (let i = 1; i < curve.length; ++i) {
      ctx.lineTo(curve[i][0], curve[i][1]);
    }
    ctx.stroke();
  }
}

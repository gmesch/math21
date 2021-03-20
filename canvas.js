function drawCurve(ctx, curve) {
  ctx.beginPath();
  ctx.moveTo(curve[0][0], curve[0][1]);
  for (let i = 1; i < curve.length; ++i) {
    ctx.lineTo(curve[i][0], curve[i][1]);
  }
  ctx.stroke();
}

function canvasInit() {
  const canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'orange';
  
  let drawing = false;
  const curves = [];
  let curve = null;

  draw = function() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for (const curve of curves) {
      drawCurve(ctx, curve);
    }
    if (curve && curve.length > 0) {
      drawCurve(ctx, curve);
    }
  };
  
  canvas.addEventListener('mousedown', function(event) {
    drawing = true;
    curve = [];
  });
  
  canvas.addEventListener('mouseup', function(event) {
    drawing = false;
    if (curve.length > 0) {
      curves.push(curve);
    }
    curve = null;
    draw();
  });

  canvas.addEventListener('mousemove', function(event) {
    if (drawing) {
      curve.push([event.offsetX, event.offsetY]);
      draw();
    }
  });

  let mouseover = false;
  canvas.addEventListener('mouseover', function(event) {
    mouseover = true;
  });
  canvas.addEventListener('mouseout', function(event) {
    mouseover = false;
  });

  document.body.addEventListener('keydown', function(event) {
    if (mouseover) {
      if (event.keyCode == 8) {
        // delete
        if (curve) {
          curve.splice(0);
        } else {
          curves.pop();
        }
      }
      draw();
    }
  });
}

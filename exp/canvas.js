function $(id) {
  return document.getElementById(id);
}

function screen(canvas) {
  $('screen').innerHTML = canvas.getScreen();
}  

function canvasInit() {
  const canvas = new Canvas($('canvas'));
  canvas.setShown(true);
  screen(canvas);

  $('next').addEventListener('click', function() {
    canvas.setScreen(canvas.getScreen() + 1);
    screen(canvas);
  });

  $('prev').addEventListener('click', function() {
    if (canvas.getScreen() > 0) {
      canvas.setScreen(canvas.getScreen() - 1);
      screen(canvas);
    }
  });

  $('save').addEventListener('click', function() {
    const opts = {
      types: [{
        description: 'PNG',
        accept: {'image/png': ['.png']},
      }],
    };
    canvas.toBlob(async function(blob) {
      const handle = await window.showSaveFilePicker(opts);
      const writable = await handle.createWritable();
      await writable.write(blob);
      writable.close();
    });
  });
}

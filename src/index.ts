import * as k from 'konva';
const Konva = k.default;

if (document !== undefined) {

    var width = window.innerWidth;
    var height = window.innerHeight;

    const stage = new Konva.Stage({
        container: 'content',
        width: width,
        height: height,
    });

    var layer = new Konva.Layer();

      var rect1 = new Konva.Rect({
        x: 20,
        y: 20,
        width: 101,
        height: 50,
        fill: 'green',
        stroke: 'red',
        strokeWidth: 4,
      });
      // add the shape to the layer
      layer.add(rect1);

      var rect2 = new Konva.Rect({
        x: 150,
        y: 40,
        width: 100,
        height: 50,
        fill: 'red',
        shadowBlur: 10,
        cornerRadius: 10,
      });
      layer.add(rect2);

      var rect3 = new Konva.Rect({
        x: 50,
        y: 120,
        width: 100,
        height: 100,
        fill: 'red',
        cornerRadius: [0, 10, 20, 30],
      });
      layer.add(rect3);

      // add the layer to the stage
      stage.add(layer);
}
else {
    // the error code you need to execute when document is undefined. This is equivalent to a general "catch" block
    console.error("Cannot initialize Konva: document is undefined"); 
}

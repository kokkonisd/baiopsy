let model = {
    "input": [40, 32, 1],
    "conv2d_1": [4, [3, 3], [1, 1], 1],
    "conv2d_2": [4, [3, 3], [2, 2], 1],
    "conv2d_3": [32, [3, 3], [1, 1], 1],
    "conv2d_4": [32, [3, 3], [2, 2], 1],
    "conv2d_5": [64, [3, 3], [1, 1], 1],
    "conv2d_6": [64, [3, 3], [2, 2], 1],
}

let multiplier = 1;


function calculateMultiplier (model)
{
    let minWH = 1e6;
    let minLayer = "input";

    for (let layer in model) {
        if (model[layer][0] + model[layer][1] < minWH) {
            minWH = model[layer][0] + model[layer][1];
            minLayer = layer;
        }
    }

    return 5 / min(model[minLayer][0], model[minLayer][1]);
}


function drawCube (x, y, width, height, depth, wText, hText, dText) {
    let d = depth * 1;
    let fontSize = 16;

    noFill();
    beginShape();    
    vertex(x, y);
    vertex(x + d, y - d);
    vertex(x + d + width, y - d);
    vertex(x + d + width, y - d + height);
    vertex(x + width, y + height);
    vertex(x, y + height);
    endShape(CLOSE);

    beginShape();
    vertex(x, y);
    vertex(x + width, y);
    vertex(x + width, y + height);
    endShape();

    beginShape();
    vertex(x + width, y);
    vertex(x + d + width, y - d);
    endShape();


    fill(0, 0, 0);
    textSize(fontSize);
    textAlign(CENTER);
    text(wText, x + (width / 2), y + height + fontSize);
    text(hText, x - fontSize, y + (height / 2) + fontSize / 2);
    push();
    translate(x + width, y + height);
    rotate(radians(-45));
    text(dText, (d / sin(radians(45))) / 2, fontSize);
    pop();
}


function calculateNextLayerDimensions (width, height, depth, layer)
{
    let output = [0, 0, 0];

    if (layer.substring(0, 6) === "conv2d") {
        let filters = model[layer][0];
        let kernel = model[layer][1];
        let strides = model[layer][2];
        let padding = model[layer][3];

        output[0] = floor((height - kernel[0] + 2 * padding) / strides[0]) + 1;
        output[1] = floor((width - kernel[1] + 2 * padding) / strides[1]) + 1;
        output[2] = filters;
    }

    return output;
}

function setup() {
  createCanvas(windowWidth, windowHeight * 10);  
  //multiplier = calculateMultiplier(model);
  multiplier = 5;
}

function draw() {

    let y = 50;

    let width = 0;
    let height = 0;
    let depth = 0;

    for (let layer in model) {
        if (layer == "input") {
            width = model[layer][1];
            height = model[layer][0];
            depth = model[layer][2];            
        } else {
            dimensions = calculateNextLayerDimensions(width, height, depth, layer);
            width = dimensions[1];
            height = dimensions[0];
            depth = dimensions[2];
        }

        drawCube(windowWidth / 2 - (width * multiplier) / 2, y,
                 width * multiplier, height * multiplier, depth * multiplier,
                 width, height, depth);

        y += (height + depth * 2 + 30) * multiplier;
    }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

let model = {
    "input": [32, 40, 1],
    "conv2d_1": [4, [3, 3], [1, 1], 1],
    "conv2d_2": [4, [3, 3], [2, 2], 1],
    "conv2d_3": [32, [3, 3], [1, 1], 1],
    "conv2d_4": [32, [3, 3], [2, 2], 1],
    "conv2d_5": [64, [3, 3], [1, 1], 1],
    "conv2d_6": [64, [3, 3], [2, 2], 1],
}

let multiplier = 1;
let blockList = [];
let fontSize = 16;


function calculateMultiplier (blockList)
{
    let minWH = blockList[0][0] + blockList[0][1];
    let minBlock = blockList[0];

    for (let i = 0; i < blockList.length; i++) {
        if (blockList[i][0] + blockList[i][1] < minWH) {
            minWH = blockList[i][0] + blockList[i][1];
            minBlock = blockList[i];
        }
    }

    return 5 / min(minBlock[0], minBlock[1]);
}


function drawCube (x, y, width, height, depth, multiplier) {
    let w = width * multiplier;
    let h = height * multiplier
    let d = depth * multiplier;

    noFill();
    beginShape();    
    vertex(x, y);
    vertex(x + d, y - d);
    vertex(x + d + w, y - d);
    vertex(x + d + w, y - d + h);
    vertex(x + w, y + h);
    vertex(x, y + h);
    endShape(CLOSE);

    beginShape();
    vertex(x, y);
    vertex(x + w, y);
    vertex(x + w, y + h);
    endShape();

    beginShape();
    vertex(x + w, y);
    vertex(x + d + w, y - d);
    endShape();


    fill(0, 0, 0);
    textSize(fontSize);
    textAlign(CENTER);
    text(width, x + (w / 2), y + h + fontSize);
    text(height, x - fontSize, y + (h / 2) + fontSize / 2);
    push();
    translate(x + w, y + h);
    rotate(radians(-45));
    text(depth, (d / sin(radians(45))) / 2, fontSize);
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

        output[0] = floor((width - kernel[0] + 2 * padding) / strides[0]) + 1;
        output[1] = floor((height - kernel[1] + 2 * padding) / strides[1]) + 1;
        output[2] = filters;
    }

    return output;
}

function setup() {
    createCanvas(windowWidth, windowHeight * 10);  

    for (let layer in model) {
        if (layer == "input") {
            width = model[layer][0];
            height = model[layer][1];
            depth = model[layer][2];            
        } else {
            dimensions = calculateNextLayerDimensions(width, height, depth, layer);
            width = dimensions[0];
            height = dimensions[1];
            depth = dimensions[2];
        }

        append(blockList, [width, height, depth]);
    }

    multiplier = calculateMultiplier(blockList);
}

function draw() {

    let y = 50;

    for (let i = 0; i < blockList.length; i++) {
        drawCube(windowWidth / 2 - (blockList[i][0] + blockList[i][2]) * multiplier / 2, y,
                 blockList[i][0], blockList[i][1], blockList[i][2], multiplier);

        y += (blockList[i][1]) * multiplier;
        if (i + 1 < blockList.length) {
            y += (blockList[i + 1][2]) * multiplier + fontSize * 2;
        }
    }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

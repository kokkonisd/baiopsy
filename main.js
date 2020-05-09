let multiplier = 1;
let blockList = [];
let fontSize = 16;
let fontRegular;
let fontItalic;
let fontBold;
let input;
let btn;


function calculateMultiplier (blockList)
{
    let minW = blockList[0][0];

    for (let i = 0; i < blockList.length; i++) {
        if (blockList[i][0] < minW) {
            minW = blockList[i][0];
        }
    }

    return windowWidth * 0.05 / minW;
}


function drawCube (x, y, width, height, depth, multiplier)
{
    let w = width * multiplier;
    let h = height * multiplier
    let d = depth * multiplier;

    if (width === 0 && height === 0 && depth === 0) {
        let w = 10 * multiplier;
        let h = 10 * multiplier;
        let d = 10 * multiplier;

        width = "?";
        height = "?";
        depth = "?";
    }

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

    text('(' + width + ', ' + height + ', ' + depth + ')',
         windowWidth / 2, y + h + fontSize * 3);
}


function calculateNextLayerDimensions (width, height, depth, layer)
{
    let output = [0, 0, 0];

    switch (layer.class_name) {
        case "Conv2D":
        case "SeparableConv2D":
            let filters = layer.config.filters;
            let kernel = layer.config.kernel_size;
            let strides = layer.config.strides;
            let padding = layer.config.padding === "same" ? 1 : 0;

            output[0] = floor((width - kernel[0] + 2 * padding) / strides[0]) + 1;
            output[1] = floor((height - kernel[1] + 2 * padding) / strides[1]) + 1;
            output[2] = filters;
            break;


        case "MaxPooling2D":
            let pool = layer.config.pool_size;
            output[0] = floor(width / pool[0]);
            output[1] = floor(height / pool[1]);
            output[2] = depth;

            break;


        case "GlobalAveragePooling2D":
            output[0] = 1;
            output[1] = 1;
            output[2] = depth;

            break;


        case "Flatten":
            output[0] = width * height * depth;
            output[1] = 1;
            output[2] = 1;

            break;


        case "Dense":
            let units = layer.config.units;
            output[0] = units;
            output[1] = 1;
            output[2] = 1;

            break;

        default:
            output[0] = 0;
            output[1] = 0;
            output[2] = 0;

            break;
    }

    return output;
}


function calculateBlocks (modelData)
{
    console.log(modelData);
    let width = 0;
    let height = 0;
    let depth = 0;
    let layers = modelData.config.layers;

    for (let i = 0; i < layers.length; i++) {
        if (layers[i].config.batch_input_shape) {
            width = layers[i].config.batch_input_shape[1];
            height = layers[i].config.batch_input_shape[2];
            depth = layers[i].config.batch_input_shape[3];    
            append(blockList, [width, height, depth, "Input"]);        
        }

        dimensions = calculateNextLayerDimensions(width, height, depth, layers[i]);
        width = dimensions[0];
        height = dimensions[1];
        depth = dimensions[2];

        append(blockList, [width, height, depth, layers[i].class_name]);
    }

    multiplier = calculateMultiplier(blockList);

    let totalHeight = 0;
    for (let i = 0; i < blockList.length; i++) {
        totalHeight += blockList[i][1] + blockList[i][2];
    }

    resizeCanvas(windowWidth - 23, totalHeight * multiplier + 300 * blockList.length + 300);
}


function handleFile (file)
{
    blockList = [];

    loadJSON(file.data, calculateBlocks);    
}


function loadExample ()
{
    blockList = [];

    loadJSON('model.json', calculateBlocks);
}


function setup ()
{
    createCanvas(windowWidth - 23, windowHeight - 23);  

    input = createFileInput(handleFile);
    btn = createButton('load an example');
    btn.mousePressed(loadExample)
    smooth();
}


function preload ()
{
    fontRegular = loadFont("assets/DM_Mono/DMMono-Regular.ttf");
    fontItalic = loadFont("assets/DM_Mono/DMMono-Italic.ttf");
    fontBold = loadFont("assets/DM_Mono/DMMono-Medium.ttf");
}


function draw ()
{
    let y = 100;

    // clear canvas
    background('white');
    
    // Title & subtitle
    textFont(fontRegular);
    textAlign(CENTER);
    textSize(100);
    text("baiopsy", windowWidth / 2, y);
    y += 50;
    textSize(20);
    text("take a peek at your model's inner workings", windowWidth / 2, y);
    y += 50;
    // Input
    input.position(windowWidth / 2 - 100, y);
    y += 60;
    text("or", windowWidth / 2, y);
    y += 25;
    btn.position(windowWidth / 2 - 60, y);
    y += 50

    // Draw model
    y += blockList[0] ? blockList[0][2] + 50 : 50;
    for (let i = 0; i < blockList.length; i++) {
        drawCube(windowWidth / 2 - (blockList[i][0] + blockList[i][2]) * multiplier / 2, y,
                 blockList[i][0], blockList[i][1], blockList[i][2], multiplier);

        y += (blockList[i][1]) * multiplier + 80;

        if (i + 1 < blockList.length) {
            drawArrow(windowWidth / 2, y, windowWidth / 2, y + 50);
            y += 50;
            textAlign(CENTER);
            text(blockList[i + 1][3], windowWidth / 2, y + fontSize + 10);
            y += fontSize * 2 + 10;
            drawArrow(windowWidth / 2, y, windowWidth / 2, y + 50);
            y += 50;
        }

        if (i + 1 < blockList.length) {
            y += (blockList[i + 1][2]) * multiplier + fontSize * 2;
        }
    }

    // Draw footer
    y += 100;
    strokeWeight(5);
    line(0, y, windowWidth, y);
    y += 50;
    text("made by kokkonisd using p5.js", windowWidth / 2, y);
    strokeWeight(1);
}


function windowResized ()
{
    resizeCanvas(windowWidth - 23, windowHeight - 23);  
}


// draw an arrow for a vector at a given base position
function drawArrow (x1, y1, x2, y2)
{
    push();
    stroke('black');
    strokeWeight(3);
    fill('black');
    line(x1, y1, x2, y2);
    let arrowSize = 7;
    triangle(x2 - arrowSize / 2, y2 - arrowSize,
             x2 + arrowSize / 2, y2 - arrowSize,
             x2, y2);
    pop();
}

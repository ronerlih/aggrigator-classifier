const cv = require('opencv4nodejs');
const fs = require('fs');
const path = require('path');
const tasks  = require('./commons.js');
const utils = require('./utils');


const DETECTION_INTERVAL = 100;
let displayedRects = [];
let frameCount =0;

////
//DNN
////

if (!cv.xmodules.dnn) {
  throw new Error('exiting: opencv4nodejs compiled without dnn module');
}

// replace with path where you unzipped inception model
const inceptionModelPath = './dnn/inception5h';

//const modelFile = path.resolve(inceptionModelPath, 'tensorflow_inception_graph.pb');
//const classNamesFile = path.resolve(inceptionModelPath, 'imagenet_comp_graph_label_strings.txt');
const modelFile = path.resolve(inceptionModelPath, 'test2.pb');
const classNamesFile = path.resolve(inceptionModelPath, 'test_classes.txt');
if (!fs.existsSync(modelFile) || !fs.existsSync(classNamesFile)) {
  console.log('could not find inception model');
  console.log('download the model from: https://storage.googleapis.com/download.tensorflow.org/models/inception5h.zip');
  throw new Error('exiting');
}

// read classNames and store them in an array
const classNames = fs.readFileSync(classNamesFile).toString().split('\n');

// initialize tensorflow inception model from modelFile
const net = cv.readNetFromTensorflow(modelFile);

const classifyImg = (img) => {
  //  model works with 150 x 150 images, so we resize
  // our input images and pad the image with white pixels to
  // make the images have the same width and height
//  const maxImgDim = 224;
//  const white = new cv.Vec(255, 255, 255);
//  const imgResized = img.resizeToMax(maxImgDim).padToSquare(white);
  const imgResized = img.resize(150,150);

  // network accepts blobs as input
  const inputBlob = cv.blobFromImage(imgResized);
  net.setInput(inputBlob);

  // forward pass input through entire network, will return
  // classification result as 1xN Mat with confidences of each class
  const outputBlob = net.forward();
	
	for(i=0; i<outputBlob.cols; i++){
	console.log("outputBlob at " + i +": " + outputBlob.at(0, i));
	
	}

	console.log("outputBlob:" + JSON.stringify(outputBlob, null, 2));
  // find all labels with a minimum confidence
  const minConfidence = 0.05;
  const locations =
    outputBlob
      .threshold(minConfidence, 1, cv.THRESH_BINARY)
      .convertTo(cv.CV_8U)
      .findNonZero();
		
		if(locations != null && locations.length > 1){
//		console.log("locations: " + JSON.stringify(locations,null,2));
		if(locations[0].confidence === locations[1].confidence){
			return ['Looks mixed with ' + locations[1].confidence + '% confidence'];
//			return ['Looks mixed with ' + (locations[1].confidence - Math.floor(Math.random() * 1000)/1000) + '% confidence'];
		}
		}
	  const result =
    locations.map(pt => ({
      confidence: parseFloat(outputBlob.at(0, pt.x) * 100) ,
      className: classNames[pt.x]
    }))	 
      // sort result by confidence
      .sort((r0, r1) => r1.confidence - r0.confidence)
		.map(res => `Looks ${res.className} with ${res.confidence}% confidence`);
//      .map(res => `Looks ${res.className} with ${res.confidence - (Math.floor(Math.random() * 1000)/1000)}% confidence`);	
		
		return result;

}

////
//face detection
////

const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
let whiteMat = new cv.Mat(100, 100,cv.CV_8UC3, [50, 50, 50])
const webcamPort = 0;

function detectFaces(img) {
  // restrict minSize and scaleFactor for faster processing
  const options = {
    minSize: new cv.Size(100, 100),
    scaleFactor: 1.2,
    minNeighbors: 10
  };
  return classifier.detectMultiScaleGpu(img.bgrToGray(), options).objects;
}


function calcMovement(faceIndex){
	if(displayedRects[faceIndex] == null){
		displayedRects[faceIndex] = new cv.Rect();
	}

}

function faceRects(faces, img){
img = img.flip(1);

if(faces.length){
	
	img = img.flip(1);
//	console.log("facerects: "+ JSON.stringify(faces,null,2));
//	face = img.getRegion(new cv.Rect(faces[0].x,faces[0].y,faces[0].width,faces[0].height) );
//	img = img.add(whiteMat);
//	img = img.gaussianBlur(new cv.Size(15, 15), 30.2)
//	face.copyTo(img.getRegion(new cv.Rect(faces[0].x,faces[0].y,faces[0].width,faces[0].height)));
//	
	faces.forEach((face, index)=>{
		
		console.log("face idx: " + index);
		calcMovement(index);
		
		utils.drawGrayRect(img, face);
		whiteMat = whiteMat.resize(face.width,face.height);
		_face = img.getRegion(new cv.Rect(face.x,face.y,face.width,face.height));
		clone = _face.bgrToGray().cvtColor(cv.COLOR_GRAY2BGR);
		_face = _face.addWeighted(0,clone,1,0);
		_face.copyTo(img.getRegion(new cv.Rect(face.x,face.y,face.width,face.height)));
		
			img = img.flip(1);
	////
	//run dnn prediction
	////
	
		input = _face.resize(150,150);
//cv.imshow('jewishFinder', face.bgrToGray().cvtColor(cv.COLOR_GRAY2BGR));;
		
		const predictions = classifyImg(clone);
//		console.log("prediction length: " + predictions.length);
//	  	predictions.forEach(p => console.log("p:" +p + "\nprediction length: " + predictions.length ));

		const alpha = 0.4;
		cv.drawTextBox(
		 img,
		 { x: img.cols - face.x - face.width, y: face.y -30 },
		 predictions.map(p => ({ text: p, fontSize: 0.5, thickness: 1 })),
		 alpha
		);


	});
}
//img = img.rescale(0.5);
//cv.imshow('jewishFinder', img);
}

//get video, main frame loop
utils.grabFrames(webcamPort, 1, (frame) => {
// resize and flip hori
frame = frame.resizeToMax(800).flip(1);


cv.imshow('jewishFinder', frame);
frameCount++;

});


//run face detectioun
//tasks.runVideoFaceDetection(webcamPort, detectFaces, faceRects);


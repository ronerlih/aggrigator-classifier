//import KerasJS from 'keras-js'

const cv = require('opencv4nodejs'),
fs = require('fs'),
request = require('request'),
download = require('image-downloader'),
http = require('http'),      
https = require('https'),  
axios = require('axios'),
Stream = require('stream').Transform;                                

//get input images urls
var inputs = JSON.parse(fs.readFileSync('input-urls.json', 'utf8'));
let imageName;

//face detection callifier
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
let faceCount = 0;

//save jewish inputs
let jewishImagesLength = inputs.jewishImages.length;
let jewishImagesIndex = 0;
let gentileImagesLength = inputs.gentileImages.length;
let gentileImagesIndex = 0;
									
url = inputs.jewishImages[0];
imagesToFaces(url);

function imagesToFaces(src){
	console.log("url: " + src);
	
	// GET request for remote image
	axios({
	  method:'get',
	  url:src,
	  responseType:'stream'
	})
	  .then(function(response) {

	  imageName = 'downloaded_jewish/' + src.slice(src.length-8);
	  response.data.pipe(fs.createWriteStream(imageName)).on('close', function(){
	  console.log(imageName + " downloaded.");

	  //face detection
	//  cv.imshow('mat', mat);
	//  cv.waitKey();

		// via Promise
		cv.imreadAsync('./' +imageName)
		  .then(mat =>
			 mat.bgrToGrayAsync()
				.then(grayImg => classifier.detectMultiScaleAsync(grayImg))
				.then((res) => {
				  const { objects, numDetections } = res;
					//each face
					let imageFaces = 0;
					console.log("faces length: " + res.objects.length);
					if(res.objects.length == 0){jewishImagesIndex++}
					res.objects.forEach( face => {
	//				console.log("face: " + JSON.stringify(face,null,2));
						rect = new cv.Rect(face.x, face.y, face.width, face.height);
						faceMat = mat.getRegion(rect);
						
						//draw on origin
						mat.drawRectangle ( rect , new cv.Vec(100, 255, 0) ,1 , 8 , 0 );
						
						
						faceMat = faceMat.resize(150,150);
						faceMat.bgrToGrayAsync()
							.then(gray => { 
								cv.imwrite('./downloaded_jewish/faces/' + faceCount + '.jpg', gray);
								faceCount++;
								imageFaces++;
								
								//draw on origin img
								if(faceCount != 14){
								mat.putText ( faceCount.toString()  , new cv.Point(face.x, face.y) , 0 , 0.7 ,  new cv.Vec(100, 255, 0) ,1 ,  1 , 0 );
								}
								
								console.log("imageFaces: " + imageFaces + ", numDetections -1: " + (numDetections.length ));
								
								if(imageFaces == numDetections.length){
								jewishImagesIndex++;
								console.log("\nimage faces complete");
								console.log("jewishImagesIndex: " + jewishImagesIndex + ', jewishImagesLength : ' + (jewishImagesLength ));
								
								//write image faces
								cv.imwrite('./' + imageName , mat);
										
									if(jewishImagesIndex == jewishImagesLength){
									console.log("\n1st batch completed");
									
									//////save gentile inputs
									
									url = inputs.gentileImages[0];
									imagesToGentileFaces(url);
									

									}else{
										
										imageFaces = 0;
										url = inputs.jewishImages[jewishImagesIndex];
										console.log("calling: " + url);
										imagesToFaces(url);
									}
								}
							})


					});
					})
		  )
		  .catch(err => console.error(err));
			});
	});
}



function imagesToGentileFaces(src){
	console.log("url: " + src);
	
	// GET request for remote image
	axios({
	  method:'get',
	  url:src,
	  responseType:'stream'
	})
	  .then(function(response) {

	  imageName = 'downloaded_gentile/' + src.slice(src.length-8);
	  response.data.pipe(fs.createWriteStream(imageName)).on('close', function(){
	  console.log(imageName + " downloaded.");

	  //face detection

		cv.imreadAsync('./' +imageName)
		  .then(mat =>
			 mat.bgrToGrayAsync()
				.then(grayImg => classifier.detectMultiScaleAsync(grayImg))
				.then((res) => {
				  const { objects, numDetections } = res;
					//each face
					let imageFaces = 0;
					res.objects.forEach( face => {
	//				console.log("face: " + JSON.stringify(face,null,2));

						rect = new cv.Rect(face.x, face.y, face.width, face.height);
						faceMat = mat.getRegion(rect);
						
						//draw on origin
						mat.drawRectangle ( rect , new cv.Vec(255, 100, 0) ,1 , 8 , 0 );

						faceMat = faceMat.resize(150,150);
						faceMat.bgrToGrayAsync()
							.then(gray => { 
								cv.imwrite('./downloaded_gentile/faces/' + faceCount + '.jpg', gray);
								faceCount++;
								imageFaces++;
								
								//draw on origin img
								if(faceCount != 14){
								mat.putText ( faceCount.toString()  , new cv.Point(face.x, face.y) , 0 , 0.7 ,  new cv.Vec(255, 100, 0) ,1 ,  1 , 0 );
								}
								
//								console.log("imageFaces: " + imageFaces + ", numDetections -1: " + numDetections -1);
								if(imageFaces == numDetections.length ){
								gentileImagesIndex++;
								
								//write image faces
								cv.imwrite('./' + imageName , mat);
								
								
								console.log("image faces complete");
									if(gentileImagesIndex == gentileImagesLength ){
									
										//write image faces
										cv.imwrite('./' + imageName , mat);
										console.log("\n2st batch completed");
									
									}else{
										url = inputs.gentileImages[gentileImagesIndex];
										console.log("call url: " + url);
										imagesToGentileFaces(url);
									}
								}
							})


					});
					})
		  )
		  .catch(err => console.error(err));
			});
	});
}






















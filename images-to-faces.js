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
inputs.jewishImages.forEach((url)=>{
console.log("url: " + url);

// GET request for remote image
axios({
  method:'get',
  url:url,
  responseType:'stream'
})
  .then(function(response) {

  imageName = 'downloaded_jewish/' + url.slice(url.length-8);
  response.data.pipe(fs.createWriteStream(imageName)).on('close', function(){
  console.log(imageName + " downloaded.");
  
  //read img to opencv cv mat
//  const mat = cv.imread('./' + );
  
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
				
				res.objects.forEach( face => {
//				console.log("face: " + JSON.stringify(face,null,2));
					
					faceMat = mat.getRegion(new cv.Rect(face.x, face.y, face.width, face.height));
					faceMat = faceMat.resize(64,64);
					faceMat.bgrToGrayAsync()
						.then(gray => { 
							cv.imwrite('./downloaded_jewish/faces/' + faceCount + '.jpg', gray);
							faceCount++;}
							)
			
					
				});
				})
	  )
	  .catch(err => console.error(err));

	


  		});

	imageName =  imageName;
  
});

});


//
//cv.imshow('img', blueMat);
//cv.waitKey();






































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


//save jewish inputs
inputs.jewishImages.forEach((url)=>{

imageName = 'downloaded_jewish/' + url.slice(url.length-8);

// GET request for remote image
axios({
  method:'get',
  url:url,
  responseType:'stream'
})
  .then(function(response) {
  
  response.data.pipe(fs.createWriteStream(imageName)).on('close', function(){
  console.log("close");
  
  //read img to opencv cv mat
//  const mat = cv.imread('./' + );
  
  //face detection

	// via Promise
	cv.imreadAsync('./' +imageName)
	  .then(mat =>
		 mat.bgrToGrayAsync()
			.then(grayImg => classifier.detectMultiScaleAsync(grayImg))
			.then((res) => {
			  const { objects, numDetections } = res;
				
				console.log("res: " + JSON.stringify(res,null,2));
				})
	  )
	  .catch(err => console.error(err));

	
//  cv.imshow('mat', mat);
//  cv.waitKey();

});

	imageName =  imageName;
  
});

});


//
//cv.imshow('img', blueMat);
//cv.waitKey();






































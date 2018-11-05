const cv = require('opencv4nodejs');
const fs = require('fs');
const request = require('request');
const download = require('image-downloader')
const http = require('http'),      
https = require('https'),  
axios = require('axios'),
    Stream = require('stream').Transform;                                

//get input images urls
var inputs = JSON.parse(fs.readFileSync('input-urls.json', 'utf8'));
let imageName;
//download 
//var download = function(uri, filename, callback){
//  request.head(uri, function(err, res, body){
//    console.log('content-type:', res.headers['content-type']);
//    console.log('content-length:', res.headers['content-length']);
//
//    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//  });
//}

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
  
  const mat = cv.imread('./' + imageName);
  cv.imshow('mat', mat);
  cv.waitKey();

});

	imageName =  imageName;
  
});

});


//
//cv.imshow('img', blueMat);
//cv.waitKey();
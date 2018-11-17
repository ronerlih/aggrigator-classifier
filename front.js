//const cv = require('opencv4nodejs');
const KerasJS = require('keras-js');
const model = new KerasJS.Model({
  filepath: first_try_weights.buf',
  filesystem: true
});

model
  .ready()
  .then(() => {
    // input data object keyed by names of the input layers
    // or `input` for Sequential models
    // values are the flattened Float32Array data
    // (input tensor shapes are specified in the model config)
    const inputData = {
      input_1: new Float32Array(data)
    }

    // make predictions
    return model.predict(inputData)
  })
  .then(outputData => {
    // outputData is an object keyed by names of the output layers
    // or `output` for Sequential models
    // e.g.,
    // outputData['fc1000']
  })
  .catch(err => {
    // handle error
  })
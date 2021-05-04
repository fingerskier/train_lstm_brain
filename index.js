/**
 * 
 * @param {filepath} netFile ~ brain json model-file
 * @param {filepath} dataFile ~ the text to be read 
 */
module.exports = function(netFile, dataFile, start_line, num_lines=5, net_config) {
  const brain = require('brain.js')
  const fs = require('fs')

  net_config = net_config || {
    iterations: 1000,
    log: details => console.log(details),
    errorThresh: 0.011
  }

  let textData = fs.readFileSync(dataFile).toString()
  textData = textData.split(/[\n\r]/)

  // textData = textData.split(/[\.\;\:\!\?\”\“\"\'\n\r]/)
  textData = textData.map(X=>X.trim())
  textData = textData.filter(X=>X.length)

  start_line = start_line ||  Math.floor(Math.random() * (textData.length - num_lines))

  const end_line = start_line + num_lines
  const trainingData = textData.slice(start_line, end_line)
  // const trainingData = textData[start_line]

  console.log(start_line, trainingData)
  if (!(trainingData && trainingData.length)) {
    console.error('no training-data')
    return
  }

  let model

  try {
    model = require(netFile)
  } catch (error) {
    console.error(model)
  }

  const lstm = new brain.recurrent.LSTM();
  if (model) lstm.fromJSON(model)

  const result = lstm.train(trainingData, net_config);

  fs.writeFileSync(netFile, JSON.stringify(lstm.toJSON()))

  for (let data of trainingData) {
    const words = data.split(' ')
    const testPhrase = words[0] + ' ' + words[1]
    console.log('run:', testPhrase, lstm.run(testPhrase))
  }
}
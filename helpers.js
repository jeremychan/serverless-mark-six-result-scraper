const cheerio = require('cheerio');
const moment = require('moment');
const dynamoDb = require('./dynamodb')

function catchEm(promise) {
  return promise.then(data => [null, data])
    .catch(err => [err]);
}

function extractResult (html) {
  const $ = cheerio.load(html);
  const ballsRows = $('.result .balls li');
  const balls = [];
  ballsRows.each((i, el) => {

    let ball = $(el).text().trim();
    balls.push(ball);
  });

  return {
    numbers: balls
  };
}

const getResultsFromDb = (callback) => {
  var params = {
      TableName: process.env.RESULTS_TABLE,
      ProjectionExpression: "drawDate, numbers, specialNumber"
  };
  const onScan = (err, data) => {
      if (err) {
          console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
      } else {
          console.log("Scan succeeded.");
          return callback(null, {
              statusCode: 200,
              body: JSON.stringify(data.Items)
          });
      }
  };
  dynamoDb.scan(params, onScan);
}

const getDrawDatesFromDb = (callback) => {
  var params = {
      TableName: process.env.RESULTS_TABLE,
      IndexName: "drawDateIndex"
  };
  const onScan = (err, data) => {
      if (err) {
          console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
      } else {
          console.log("Scan succeeded.");
          return callback(null, {
              statusCode: 200,
              body: JSON.stringify(data.Items.map(i => i['drawDate']))
          });
      }
  };
  dynamoDb.scan(params, onScan);
}

const saveResultsToDb = async (results) => {
  for (result of results) {
    await saveResultToDb(resultInfo(result))
  }
}

const saveResultToDb = async (result) => {
  const resultInfo = {
    TableName: process.env.RESULTS_TABLE,
    Item: result,
  };
  return await dynamoDb.put(resultInfo).promise()
};

const resultInfo = (result) => {
  const timestamp = new Date().getTime();
  return {
    drawDate: result.date,
    numbers: result.numbers,
    specialNumber: result.specialNumber,
    createdAt: timestamp
  };
};

module.exports = {
 extractResult,
 catchEm,
 saveResultToDb,
 saveResultsToDb,
 getResultsFromDb,
 getDrawDatesFromDb
};

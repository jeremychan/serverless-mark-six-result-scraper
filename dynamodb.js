'use strict'
const AWS = require('aws-sdk')
let options = {}
if (process.env.IS_OFFLINE) {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:3001'
  }
}
const client = new AWS.DynamoDB.DocumentClient(options)
module.exports = client
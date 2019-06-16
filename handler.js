const request = require('axios');
const moment = require('moment');
const helpers = require('./helpers');

module.exports.scrapeMarkSixResults = async (event) => {
  const currentDate = moment()

  let lastSevenDaysResults = []
  for (let i = 0; i < 7; i++) {
    const dateToCheck = moment(currentDate).subtract(i, 'days');
    const dateToCheckFormatted = dateToCheck.format("YYYY-MM-DD")
    const [err, response] = await helpers.catchEm(request(`http://lottery.hk/liuhecai/jieguo/${dateToCheckFormatted}`))
    if (!err) {
      const result = helpers.extractResult(response.data)
      console.log(result);
      lastSevenDaysResults.push({
        'date': dateToCheckFormatted, 
        'numbers': result.numbers.slice(0, -1),
        'specialNumber': result.numbers.slice(-1)[0] 
      })
    }
  }

  await helpers.saveResultsToDb(lastSevenDaysResults)

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: `Retreived ${lastSevenDaysResults.length} results`
    }),
  };
  return response
};

module.exports.getAllMarkSixResults = (event, context, callback) => {
  return helpers.getResultsFromDb(callback)
};

module.exports.getDrawDates = (event, context, callback) => {
  return helpers.getDrawDatesFromDb(callback)
};
var StatsD = require('node-statsd');

var metrics = new StatsD({host: '13.57.249.74'});

if (process.env.CHATBOX_ENV == 'DEV') {
    console.log('running locally');
    metrics.gauge = function () {};
} else {
    console.log('running on prod');
}

module.exports = metrics;

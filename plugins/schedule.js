var NanoTimer = require('nanotimer');

var exp = module.exports;

var schedule;

var startNextTimer = new NanoTimer();

function startDefault () {
    return startItem(exp.config.defaultItem);
}

function prepareNearest (date) {
    return schedule.find({
        startTime: {$gte: date}
    }).sort({startTime: 1}).limit(1).next()
    .then(function (item) {
        if (!item)
            return startDefault();

        startNextTimer.setTimeout(startItem, item,
            (item.date.getTime() - (new Date()).getTime()) + "ms"
        );
    });
}

function startItem (item) {
    if (item && item.filename)
        return exp.player.loadfile(item.filename);
    return exp.player.loadfile("/Users/rcombs/Downloads/tardis.mp4");
}

function startCurrent () {
    var date = new Date();
    schedule.findOne({
        endTime: {$gt: date},
        startTime: {$lte: date},
    }).then(function (item) {
        if (!item)
            return prepareNearest(date);
        return startItem(item);
    }).done();
}

exp.start = function () {
    schedule = exp.db.collection('schedule');
    startCurrent();
    exp.player.on('mpv.idle', startCurrent);
};

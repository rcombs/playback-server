var fs = require('fs'),
    mpv = require('mpv'),
    pmongo = require('promised-mongo');

var conf = JSON.parse(fs.readFileSync(process.argv[2] || "config.json"));

var db = pmongo(conf.db);

var player = new mpv({'mpvArgs': ['--fs', '--force-window', '--no-osc']}, startPlugins);

if (!conf.plugins)
    conf.plugins = {};
if (!conf.plugins.schedule)
    conf.plugins.schedule = {};
if (!conf.plugins.http)
    conf.plugins.http = {};
if (!conf.plugins.router)
    conf.plugins.router = {};

var plugins = {};
for (var name in conf.plugins) {
    plugins[name] = require('./plugins/' + name);
    plugins[name].config = conf.plugins[name];
    plugins[name].player = player;
    plugins[name].db = db;
    plugins[name].plugins = plugins;
}

function startPlugins () {
    for (var pl in plugins) {
        plugins[pl].start();
    }
}

const core = require('alb3rt-core'),
    devices = require('./resources/devices');

module.exports = new class Alb3rtMonitorApi {
    constructor() {
        core.api.extend('devices', devices);
    }
};

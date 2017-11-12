module.exports = new class Alb3rtMonitor {
    constructor() {
        require('alb3rt-core');
        require('./devices');
        require('./api');
    }
};
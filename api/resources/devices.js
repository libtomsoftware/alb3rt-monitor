const core = require('alb3rt-core'),
    logger = core.logger,
    CONFIG = core.config,
    STATUS_CODE = CONFIG.CONSTANTS.HTTP_CODE,
    devices = require('../../devices'),
    FILE_ID = 'resources/devices';

module.exports = new class Alb3rtMonitorResourcesDevices {

    get(request, response) {
        core.api.responder.send(response, {
            status: STATUS_CODE.OK,
            data: devices.get()
        });
    }

};
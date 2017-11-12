const core = require('alb3rt-core'),
    logger = core.logger,
    CONFIG = core.config,
    FILE_ID = 'devices';

class Alb3rtMonitorDevices {
    constructor() {
        this.timeout = null;
        this.devices = [];

        this.urlRegistry = CONFIG.URL.REGISTRY;
        this.fetch = this.fetch.bind(this);
        this.monitor = this.monitor.bind(this);
        this.handleHealthcheckResult = this.handleHealthcheckResult.bind(this);

        this.timeout = setTimeout(this.fetch, 5000);
    }

    handleHealthcheckResult(result) {
        if (typeof result === 'number') {
            const device = this.devices[result];

            logger.warn(FILE_ID, `Registered device ${device.NAME} healthcheck failed.`);
            core.http.delete({
                url: `http://${this.urlRegistry}/api/registry`,
                body: device
            }).catch((unregisterError) => {
                logger.warn(FILE_ID, `Device not removed from registry [${unregisterError}]`);
            });
        }
    }

    monitor(devices) {
        this.devices = devices;
        logger.log(FILE_ID, 'A list of registered devices received.');

        const promises = this.devices.map(device => {
            return core.http.get({
                url: `http://${device.ADDRESS.URL}:${device.ADDRESS.HTTP_PORT}/api/healthcheck`
            });
        });

        Promise.all(promises.map((promise, index) => promise.catch(() => index)))
            .then(results => {
                logger.log(FILE_ID, `Monitor polling session performed. Number of active devices: ${results.length}`);

                results.forEach(this.handleHealthcheckResult);

                clearTimeout(this.timeout);
                this.timeout = setTimeout(this.fetch, 5000);
            });
    }

    fetch() {
        if (!this.urlRegistry) {
            logger.error(FILE_ID, 'No Registry URL available! Aborting...');
            return;
        }

        logger.log(FILE_ID, 'Fetching devices from registry...');

        core.http.get({
            url: `http://${this.urlRegistry}/api/registry`
        })
        .then(this.monitor)
        .catch((error) => {
            logger.error(FILE_ID, error.message);
            this.devices = [];
            clearTimeout(this.timeout);
            this.timeout = setTimeout(this.fetch, 5000);
        });
    }

    get() {
        return this.devices;
    }
}

module.exports = new Alb3rtMonitorDevices();

const winston = require('winston');

const { createLogger, format, transports } = require('winston');

const logFormat = format.combine(
    format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
    format.align(),
    format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}: `),
)

const fileTransport =
    new transports.File({
        filename: process.env.LOG_FILE_PATH + '/logs/server.log',
        format: logFormat
    });
const consoleTransport = new transports.Console(

    {
        format: logFormat
    }
);
const logConfiguration = {
    'transports': [
        consoleTransport,
        fileTransport
    ]
};

const logger = createLogger(logConfiguration);

module.exports = logger;
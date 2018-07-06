const winston = require ('winston');
const { combine, json, colorize, simple, timestamp } = winston.format;

const logLevel = process.env.LOG_LEVEL || 'debug';

const logger = winston.createLogger ({
  level: logLevel,
  format: combine (
    json ()
    ),
  transports: [
    new winston.transports.File ({filename: 'logs/error.log', level: 'error'}),
    new winston.transports.File ({filename: 'logs/all.log'}),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add (
    new winston.transports.Console ({
      format: combine (
        colorize (),
        simple(),
      ),
    })
  );
}

module.exports = logger;

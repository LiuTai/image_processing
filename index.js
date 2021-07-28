const chalk = require('chalk')
const yargs = require('yargs')
const processor = require('./lib/image-processor')
const log = console.log;

// Customize yargs version
yargs.version('1.1.0')

// Create add command
yargs.command({
  command: 'process',
  describe: 'get order data',
  builder: {
    image_name: {
      describe: 'image_name',
      demandOption: true,
      type: 'string'
    },
    template_name: {
      describe: 'template_name',
      demandOption: true,
      type: 'string'
    },
    x: {
      describe: 'x',
      demandOption: true,
      type: 'string'
    },
    y: {
      describe: 'y',
      demandOption: true,
      type: 'string'
    },
    w: {
      describe: 'w',
      demandOption: true,
      type: 'string'
    },
    h: {
      describe: 'h',
      demandOption: true,
      type: 'string'
    }
  },
  handler(argv) {
    log(chalk.blue('processing...'));
    processor.get_single_image_vertical(argv.image_name, argv.template_name, argv.x, argv.y, argv.w, argv.h);
  }
})

yargs.parse()
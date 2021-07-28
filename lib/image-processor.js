const gm = require('gm').subClass({imageMagick: true});
const chalk = require('chalk')
const log = console.log

const get_single_image_vertical = (image_name, template_name, x, y, w, h ) => {
  gm(`./assets/templates/${template_name}`)
  .draw(`image Over ${x}, ${y}, ${w}, ${h} "./assets/original_product_images/${image_name}"`)
  .write(`./assets/processed_images/${image_name}_processed.jpg`, function(err) {
    if (!err) {
      log(chalk.blue('done'));
    }else {
      log(chalk.red(err));
    }
  })
}

module.exports = {
  get_single_image_vertical
}


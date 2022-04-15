const fs = require("fs");
const log = console.log;
const path = require("path");
const dropbox_path = "../assets/WVM All Art Images"; 
const dropbox_cloud_path = "/Users/tliu71/Dropbox/WVM All Art Images";
const gm = require("gm").subClass({ imageMagick: true });
const chalk = require("chalk");
const aspect_ratio = 792 / 1185;
const [template_width, template_height] = [792.08, 1185.15];

const read_folders_async = async (dropbox_path, is_acrylic = false, is_horizontal=false) => {
  try {
    // Get the files as an array
    let files = await fs.promises.readdir(dropbox_path);
    let folders = [];
    // Loop them all with the new for...of
    for (const file of files) {
      // Get the full paths
      const dropbox_path_artist = path.join(dropbox_path, file);
      // Stat the file to see if we have a file or dir
      const stat = await fs.promises.stat(dropbox_path_artist);
      if (
        stat.isDirectory &&
        !dropbox_path_artist.includes(".DS_") &&
        !dropbox_path_artist.includes("Icon") &&
        !dropbox_path_artist.includes(".sketch") && !is_acrylic && !is_horizontal
      ) {
        folders.push(dropbox_path_artist);
      }
      if(is_acrylic) {
        let acrylic_path = `${dropbox_path_artist}/Acrylic Images`
        if (fs.existsSync(acrylic_path)) folders.push(acrylic_path)
      }
      if(is_horizontal) {
        let horizontal_path = `${dropbox_path_artist}/Floating Frame - Horizontal`
        if (fs.existsSync(horizontal_path)) folders.push(horizontal_path)
      }
      // if (stat.isFile()) console.log("'%s' is a file.", fromPath);
      // else if (stat.isDirectory()) console.log(stat);

      // // Now move async
      // await fs.promises.rename( fromPath, toPath );

      // Log because we're crazy
      // console.log( "Moved '%s'->'%s'", fromPath, toPath );
    }
    return folders;
  } catch (e) {
    console.error("We've thrown! Whoops!", e);
  }
};

const read_files_async = async (file_path) => {
  try {
    let files = await fs.promises.readdir(file_path);
    let files_path = [];
    for (let file of files) {
      let original_image = path.join(file_path, file);
      // Stat the file to see if we have a file or dir
      let stat = await fs.promises.stat(original_image);
      if (stat.isFile() && !file.includes(".DS_Store")) {
        files_path.push(original_image);
      }
    }
    return files_path;
  } catch (e) {
    console.log(e);
  }
};

const mkdir = async (folder_path) => {
  const processed_vertical = path.join(folder_path, "processed");
  // const resize = path.join(folder_path, "resize");
  // const crop = path.join(folder_path, "crop");
  if (!fs.existsSync(processed_vertical)) {
    fs.mkdirSync(processed_vertical);
  }
  // if (!fs.existsSync(resize)) {
  //   fs.mkdirSync(resize);
  // }
  // if (!fs.existsSync(crop)) {
  //   fs.mkdirSync(crop);
  // }
};

const rmdir = async (folder_path) => {
  const processed_vertical = path.join(folder_path, "processed_vertical");
  const resize = path.join(folder_path, "resize");
  const crop = path.join(folder_path, "crop");
  if (fs.existsSync(processed_vertical)) {
    fs.rmdirSync(processed_vertical, { recursive: true });
  }
  if (fs.existsSync(resize)) {
    fs.rmdirSync(resize, { recursive: true });
  }
  if (fs.existsSync(crop)) {
    fs.rmdirSync(crop, { recursive: true });
  }
};

const get_size = async (image_path) => {
  return new Promise((resolve, reject) => {
    gm(image_path).size((err, size) => {
      if (!err) {
        console.log("width = " + size.width);
        console.log("height = " + size.height);
        console.log(size.width / size.height);
        resolve({
          width: size.width,
          height: size.height,
        });
      } else {
        reject(err);
      }
    });
  });
};

const resize = async (image_path, width, height) => {
  let resize_width = "792.08",
    resize_height = null;
  if (width / height > aspect_ratio) {
    (resize_width = null), (resize_height = "1185.15");
  }
  return new Promise((resolve, reject) => {
    gm(image_path)
      .resize(resize_width, resize_height)
      .write(`${image_path}_resize.jpg`, (err) => {
        if (!err) {
          log(chalk.blue("done"));
          resolve();
        } else {
          log(chalk.red(err));
          reject(err);
        }
      });
  });
};

const resize_horizontal = async (image_path, width, height) => {
  let resize_width = "1185.15",
    resize_height = null;
  if (width / height > aspect_ratio) {
    (resize_width = null), (resize_height = "792.08");
  }
  return new Promise((resolve, reject) => {
    gm(image_path)
      .resize(resize_width, resize_height)
      .write(`${image_path}_resize.jpg`, (err) => {
        if (!err) {
          log(chalk.blue("done"));
          resolve();
        } else {
          log(chalk.red(err));
          reject(err);
        }
      });
  });
};

const crop_images = async (image_path) => {
  return new Promise((resolve, reject) => {
    gm(`${image_path}_resize.jpg`)
      .gravity('Center')
      .crop(`${template_width}`, `${template_height}`)
      .write(`${image_path}_crop.jpg`, (err) => {
        if (!err) {
          log(chalk.blue("done"));
          resolve();
        } else {
          log(chalk.red(err));
          reject(err);
        }
      });
  });
};

const crop_images_horizontal = async (image_path) => {
  return new Promise((resolve, reject) => {
    gm(`${image_path}_resize.jpg`)
      .gravity('Center')
      .crop(`${template_height}`, `${template_width}`)
      .write(`${image_path}_crop.jpg`, (err) => {
        if (!err) {
          log(chalk.blue("done"));
          resolve();
        } else {
          log(chalk.red(err));
          reject(err);
        }
      });
  });
};

const process_vertical_images = async (image_path, folder_path, x, y, w, h) => {
  let processed_name = image_path.split("/"),
    processed_folder = folder_path.split("/");
  processed_name = processed_name[processed_name.length - 1];
  processed_folder = processed_folder[processed_folder.length - 1];
  return new Promise((resolve, reject) => {
    gm(`../assets/templates/floating_frame_background.jpg`)
      .draw(
        `image Over ${x}, ${y}, ${w}, ${h} "../assets/WVM All Art Images/${processed_folder}/${processed_name}`
      )
      .write(
        `../assets/WVM All Art Images/${processed_folder}/processed/${processed_name}_processed.jpg`,
        (err) => {
          if (!err) {
            log(chalk.blue("done"));
            resolve();
          } else {
            log(chalk.red(err));
            reject(err);
          }
        }
      );
  });
};

const process_acrylic_images = async (image_path, folder_path, x, y, w, h) => {
  let processed_name = image_path.split("/");
  processed_name = processed_name[processed_name.length - 1];
  return new Promise((resolve, reject) => {
    gm(`../assets/templates/acrylic_background.jpg`)
      .draw(
        `image Over ${x}, ${y}, ${w}, ${h} "${image_path}`
      )
      .write(
        `${folder_path}/processed/${processed_name}_processed.jpg`,
        (err) => {
          if (!err) {
            log(chalk.blue("done"));
            resolve();
          } else {
            log(chalk.red(err));
            reject(err);
          }
        }
      );
  });
};

const process_horizontal_images = async (image_path, folder_path, x, y, w, h) => {
  let processed_name = image_path.split("/");
  processed_name = processed_name[processed_name.length - 1];
  return new Promise((resolve, reject) => {
    gm(`../assets/templates/Horizontal Product Img.jpg`)
      .draw(
        `image Over ${x}, ${y}, ${w}, ${h} "${image_path}`
      )
      .write(
        `${folder_path}/processed/${processed_name}_processed.jpg`,
        (err) => {
          if (!err) {
            log(chalk.blue("done"));
            resolve();
          } else {
            log(chalk.red(err));
            reject(err);
          }
        }
      );
  });
};

const vertical_batch = async () => {
  let folders = await read_folders_async(dropbox_path);
  let files = [];
  for (let folder of folders) {
    await rmdir(folder);
    await mkdir(folder);
    files = await read_files_async(folder);
    for (let file of files) {
      let {width, height} = await get_size( `${file}`)
        await resize(
          `${file}`,
          width,
          height
        );
        await crop_images(`${file}`)
        fs.unlinkSync(`${file}_resize.jpg`);
        await process_vertical_images(
          `${file}_crop.jpg`,
          folder,
          "353.47",
          "156.53",
          "792.08",
          "1185.15"
        ).then(async () => {
          fs.unlinkSync(`${file}_crop.jpg`);
          console.log(`${file} completed`);
        });
    }
  }
};

const acrylic_batch = async () => {
  let folders = await read_folders_async(dropbox_path, true);
  let files = [];
  //console.log(folders)
  for (let folder of folders) {
    await rmdir(folder);
    await mkdir(folder);
    files = await read_files_async(folder);
    //console.log(files);
    for (let file of files) {
      let {width, height} = await get_size( `${file}`)
      if(width > height){
        await process_acrylic_images(
          `${file}`,
          folder,
          "73",
          "300",
          "1463",
          "1024"
        ).then(() => {
          console.log(`${file} completed`);
        });
      }else{
        await process_acrylic_images(
          `${file}`,
          folder,
          "301",
          "76",
          "1016",
          "1472"
        ).then(() => {
          console.log(`${file} completed`);
        });
      }
    }
  }
};

const horizontal_batch = async () => {
  let folders = await read_folders_async(dropbox_path, false, true);
  let files = [];
  console.log(folders)
  for (let folder of folders) {
    await rmdir(folder);
    await mkdir(folder);
    files = await read_files_async(folder);
    console.log(files);
    for (let file of files) {
      let {width, height} = await get_size( `${file}`)
        await resize_horizontal(
          `${file}`,
          width,
          height
        );
        await crop_images_horizontal(`${file}`)
        fs.unlinkSync(`${file}_resize.jpg`);
        await process_horizontal_images(
          `${file}_crop.jpg`,
          folder,
          "156.53",
          "353.47",
          "1185.15",
          "792.08",
        ).then(() => {
          fs.unlinkSync(`${file}_crop.jpg`);
          console.log(`${file} completed`);
        });
    }
  }
};

const new_batch = async () => {
  
}

vertical_batch()
horizontal_batch();
acrylic_batch();
const fs = require("fs");
const sharp = require("sharp");
const log = console.log;
const path = require("path");
const dropbox_path =
  "/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/WVM All Art Images";
const gm = require("gm").subClass({ imageMagick: true });
const chalk = require("chalk");
const aspect_ratio = 792 / 1185;
const [template_width, template_height] = [792.08, 1185.15];

const read_folders_async = async (dropbox_path) => {
  try {
    // Get the files as an array
    let files = await fs.promises.readdir(dropbox_path);
    let folders = [];
    // Loop them all with the new for...of
    for (const file of files) {
      // Get the full paths
      const dropbox_path_artist = path.join(dropbox_path, file);
      log(dropbox_path_artist);
      // Stat the file to see if we have a file or dir
      const stat = await fs.promises.stat(dropbox_path_artist);
      if (
        stat.isDirectory &&
        !dropbox_path_artist.includes(".DS_") &&
        !dropbox_path_artist.includes("Icon") &&
        !dropbox_path_artist.includes(".sketch")
      ) {
        folders.push(dropbox_path_artist);
      }
    }
    log(folders);
    return folders;
  } catch (e) {
    console.error("We've thrown! Whoops!", e);
  }
};

const mkdir = async (folder_path) => {
  if (!fs.existsSync(folder_path)) {
    fs.mkdirSync(folder_path);
  }
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
    log(e);
  }
};

const get_size = async (image_path) => {
  return new Promise((resolve, reject) => {
    gm(image_path).size((err, size) => {
      if (!err) {
        log(
          "width = " +
            size.width +
            " height = " +
            size.height +
            " width/ height = " +
            size.width / size.height
        );
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

const process_acrylic_images = async (
  image_path,
  folder_path,
  x,
  y,
  w,
  h,
  is_horizontal = false
) => {
  let path = image_path.split("/");
  image_name = path[path.length - 1].split(".");
  image_name = image_name.length > 2 ? image_name[0] + image_name[1] : image_name[0];
  let cover_temp =
    "/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/templates/temp_new.png";
  let bottom_temp = is_horizontal
    ? "/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/templates/Acrylic_Bottom_2.png"
    : "/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/templates/Acrylic_Bottom.png";
  await mkdir(`${folder_path}/${image_name}`);
  return new Promise((resolve, reject) => {
    gm(`${bottom_temp}`)
      .draw(`image Over ${x}, ${y}, ${w}, ${h} "${image_path}_crop.jpg`)
      .draw(`image Over ${x}, ${y}, ${w}, ${h} "${cover_temp}`)
      .write(
        `${folder_path}/${image_name}/${image_name}_processed_acrylic.jpg`,
        (err) => {
          if (!err) {
            log(chalk.blue("process_acrylic_images done"));
            resolve();
          } else {
            log(chalk.red(err));
            reject(err);
          }
        }
      );
  });
};

const acrylic_batch = async () => {
  let folders = await read_folders_async(dropbox_path);
  let files = [];
  for (let folder of folders) {
    files = await read_files_async(folder);
    for (let file of files) {
      let { width, height } = await get_size(`${file}`);
      if (width > height) {
        await resize_horizontal(`${file}`, width, height, "1347", "898");
        await crop_images_horizontal(`${file}`, "1347", "898");
        fs.unlinkSync(`${file}_resize.jpg`);
        await process_acrylic_images(
          `${file}`,
          folder,
          "76",
          "300",
          "1347",
          "897",
          true
        ).then(() => {
          fs.unlinkSync(`${file}_crop.jpg`);
          console.log(`${file}_crop completed`);
        });
      } else {
        await resize_vertical(`${file}`, width, height, "898", "1347");
        await crop_images_vertical(`${file}`,898 ,1347);
        fs.unlinkSync(`${file}_resize.jpg`);
        await process_acrylic_images(
          `${file}`,
          folder,
          "300",
          "76",
          "897",
          "1347",
          false
        ).then(() => {
          fs.unlinkSync(`${file}_crop.jpg`);
          log(`${file}_crop completed`);
        });
      }
    }
  }
};

const process_new_image = async (
  image_path,
  folder_path,
  x,
  y,
  w,
  h,
  image_name,
  bottom_temp,
  cover_temp,
  is_horizontal
) => {
  let path = bottom_temp.split("/");
  temp_name = path[path.length - 1].split(".");
  temp_name = temp_name[0];
  let { width, height } = await get_size(`${image_path}`);
  if(is_horizontal){
    await resize_horizontal(`${image_path}`, width, height, `${w}`, `${h}`);
    await crop_images_horizontal(`${image_path}`, `${w}`, `${h}`);
    fs.unlinkSync(`${image_path}_resize.jpg`);
  }else{
    await resize_vertical(`${image_path}`, width, height, `${w}`, `${h}`);
    await crop_images_vertical(`${image_path}`, `${w}`, `${h}`);
    fs.unlinkSync(`${image_path}_resize.jpg`);
  }
  return new Promise((resolve, reject) => {
    gm(`${bottom_temp}`)
      .draw(`image Over ${x}, ${y}, ${w}, ${h} "${image_path}_crop.jpg`)
      .draw(`image Over ${x}, ${y}, ${w}, ${h} "${cover_temp}`)
      .write(
        `${folder_path}/${image_name}/${image_name}_${temp_name}.jpg`,
        (err) => {
          if (!err) {
            log(chalk.blue("process_new_image done"));
            fs.unlinkSync(`${image_path}_crop.jpg`);
            resolve();
          } else {
            log(chalk.red(err));
            reject(err);
          }
        }
      );
  })
}

const process_new_images = async (
  image_path,
  folder_path,
  is_horizontal = false
) => {
  let path = image_path.split("/");
  image_name = path[path.length - 1].split(".");
  image_name = image_name.length > 2 ? image_name[0] + image_name[1] : image_name[0];
  let processAllImages = [];

  if(is_horizontal){
    let cover_pp = '/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/thanksgiving_templates/Passe-Partout - Top Layer - Horizontal.png'
    let path_pp = `/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/thanksgiving_templates/Passe-Partout - Bottom Layer`;
    await process_new_image( image_path, folder_path, 219, 373, 1004, 754, image_name, `${path_pp} - Black - H.png`, cover_pp, is_horizontal)
    await process_new_image( image_path, folder_path, 219, 373, 1004, 754, image_name, `${path_pp} - Oak - H.png`, cover_pp, is_horizontal)
    await process_new_image( image_path, folder_path, 219, 373, 1004, 754, image_name, `${path_pp} - White - H.png`, cover_pp, is_horizontal)
    
    let cover_ff = '/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/thanksgiving_templates/Floating Frame Acrylic - Top Layer - Horizontal.png'
    let path_ff = '/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/thanksgiving_templates/Floating Frame Acrylic - Bottom Layer'
    await process_new_image( image_path, folder_path, 178, 318, 1143, 861, image_name, `${path_ff} - Black - H.png`, cover_ff, is_horizontal)
    await process_new_image( image_path, folder_path, 178, 318, 1143, 861, image_name, `${path_ff} - Oak - H.png`, cover_ff, is_horizontal)
    await process_new_image( image_path, folder_path, 178, 318, 1143, 861, image_name, `${path_ff} - White - H.png`, cover_ff, is_horizontal)
  }else{
    let cover_pp = '/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/thanksgiving_templates/Passe-Partout - Top Layer - Vertical.png'
    let path_pp = `/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/thanksgiving_templates/Passe-Partout - Bottom Layer`;
    await process_new_image( image_path, folder_path, 373, 277, 754, 1004, image_name, `${path_pp} - Black - V.png`, cover_pp, is_horizontal)
    await process_new_image( image_path, folder_path, 373, 277, 754, 1004, image_name, `${path_pp} - Oak - V.png`, cover_pp, is_horizontal)
    await process_new_image( image_path, folder_path, 373, 277, 754, 1004, image_name, `${path_pp} - White - V.png`, cover_pp, is_horizontal)

    let cover_ff = '/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/thanksgiving_templates/Floating Frame Acrylic - Top Layer - Vertical.png'
    let path_ff = '/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/thanksgiving_templates/Floating Frame Acrylic - Bottom Layer'
    await process_new_image( image_path, folder_path, 318, 178, 861, 1143, image_name, `${path_ff} - Black - V.png`, cover_ff, is_horizontal)
    await process_new_image( image_path, folder_path, 318, 178, 861, 1143, image_name, `${path_ff} - Oak - V.png`, cover_ff, is_horizontal)
    await process_new_image( image_path, folder_path, 318, 178, 861, 1143, image_name, `${path_ff} - White - V.png`, cover_ff, is_horizontal)
  } 
  return Promise.all(processAllImages);
  //await mkdir(`${folder_path}/${image_name}`);
};

const new_batch = async () => {
  let folders = await read_folders_async(dropbox_path);
  let files = [];
  for (let folder of folders) {
    files = await read_files_async(folder);
    for (let file of files) {
      let { width, height } = await get_size(`${file}`);
      if (width > height) {
        await process_new_images(
          `${file}`,
          folder,
          true
        ).then(() => {
          console.log(`${file} completed`);
        });
      } else {
        await process_new_images(
          `${file}`,
          folder,
          false
        ).then(() => {
          console.log(`${file} completed`);
        });
      }
    }
  }
};

const resize_horizontal = async (image_path, width, height, resize_width, resize_height) => {
  return new Promise((resolve, reject) => {
    gm(image_path)
      .resize(null, resize_height)
      .write(`${image_path}_resize.jpg`, (err) => {
        if (!err) {
          log(chalk.blue("resize_horizontal done"));
          resolve();
        } else {
          log(chalk.red(err));
          reject(err);
        }
      });
  });
};

const resize_vertical = async (image_path, width, height, resize_width, resize_height) => {    
  if (width / height > aspect_ratio) {
    resize_width = null;
  }else{
    resize_height = null;
  }
  return new Promise((resolve, reject) => {
    gm(image_path)
      .resize(resize_width, resize_height)
      .write(`${image_path}_resize.jpg`, (err) => {
        if (!err) {
          log(chalk.blue("resize_vertical done"));
          resolve();
        } else {
          log(chalk.red(err));
          reject(err);
        }
      });
  });
};

const crop_images_vertical = async (image_path, template_width, template_height) => {
  return new Promise((resolve, reject) => {
    gm(`${image_path}_resize.jpg`)
      .gravity("Center")
      .crop(`${template_width}`, `${template_height}`)
      .write(`${image_path}_crop.jpg`, (err) => {
        if (!err) {
          log(chalk.blue("crop_images_vertical done"));
          resolve();
        } else {
          log(chalk.red(err));
          reject(err);
        }
      });
  });
};

const crop_images_horizontal = async (image_path, template_width, template_height) => {
  return new Promise((resolve, reject) => {
    gm(`${image_path}_resize.jpg`)
      .gravity("Center")
      .crop(`${template_width}`, `${template_height}`)
      .write(`${image_path}_crop.jpg`, (err) => {
        if (!err) {
          log(chalk.blue("crop_images_horizontal done"));
          resolve();
        } else {
          log(chalk.red(err));
          reject(err);
        }
      });
  });
};

const process_horizontal_image = async (
  image_path,
  folder_path,
  x,
  y,
  w,
  h
) => {
  let path = image_path.split("/");
  image_name = path[path.length - 1].split(".");
  image_name = image_name.length > 2 ? image_name[0] + image_name[1] : image_name[0];
  return new Promise((resolve, reject) => {
    gm(
      `/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/templates/Horizontal Product Img.jpg`
    )
      .draw(`image Over ${x}, ${y}, ${w}, ${h} "${image_path}_crop.jpg`)
      .write(
        `${folder_path}/${image_name}/${image_name}_processed_floating.jpg`,
        (err) => {
          if (!err) {
            log(chalk.blue("process_horizontal_image done"));
            resolve();
          } else {
            log(chalk.red(err));
            reject(err);
          }
        }
      );
  });
};

const process_vertical_image = async (image_path, folder_path, x, y, w, h) => {
  let path = image_path.split("/");
  image_name = path[path.length - 1].split(".");
  image_name = image_name.length > 2 ? image_name[0] + image_name[1] : image_name[0];
  return new Promise((resolve, reject) => {
    gm(
      `/Users/tliu71/Desktop/Tai Liu/nodejs/Projects/Nodejs/image_processing/assets/templates/floating_frame_background.jpg`
    )
      .draw(
        `image Over ${x}, ${y}, ${w}, ${h} "${image_path}_crop.jpg`
      )
      .write(
        `${folder_path}/${image_name}/${image_name}_processed_floating.jpg`,
        (err) => {
          if (!err) {
            log(chalk.blue("process_vertical_image - done"));
            resolve();
          } else {
            log(chalk.red(err));
            reject(err);
          }
        }
      );
  });
};

const process_horizontal_images = async (file, folder, width, height) => {
  await resize_horizontal(`${file}`, width, height, "1185.15", "792.08");
  await crop_images_horizontal(`${file}`, 1185.15, 792.08);
  fs.unlinkSync(`${file}_resize.jpg`);
  process_horizontal_image(
    `${file}`,
    folder,
    "156.53",
    "353.47",
    "1185.15",
    "792.08"
  ).then(() => {
    fs.unlinkSync(`${file}_crop.jpg`);
    log(`${file} completed`);
  });
};

const process_vertical_images = async (file, folder, width, height) => {
  await resize_vertical(`${file}`, width, height, "792.08", "1185.15");
  await crop_images_vertical(`${file}`, 792.08, 1185.15);
  fs.unlinkSync(`${file}_resize.jpg`);
  await process_vertical_image(
    `${file}`,
    folder,
    "353.47",
    "156.53",
    "792.08",
    "1185.15"
  ).then(() => {
    fs.unlinkSync(`${file}_crop.jpg`);
    log(`${file} completed`);
  });
};

const floating_batch = async () => {
  let folders = await read_folders_async(dropbox_path);
  let files = [];
  for (let folder of folders) {
    files = await read_files_async(folder);
    for (let file of files) {
      let { width, height } = await get_size(`${file}`);
      if (width > height) {
        await process_horizontal_images(file, folder, width, height);
      } else {
        await process_vertical_images(file, folder, width, height);
      }
    }
  }
};

const improve_resolution = async () => {
  let folders = await read_folders_async(dropbox_path);
  let files = [];
  for (let folder of folders) {
    files = await read_files_async(folder);
    for (let file of files) {
      // Convert any input to very high quality JPEG output
      const data = await sharp(`${file}`)
      .jpeg({
        quality: 100,
        chromaSubsampling: '4:4:4'
      })
      .toFile(`${file}_high_quality.jpg`, (err) => {
        console.log(err)
      });
    }
  }
}

const main = async () => {
  await acrylic_batch();
  await floating_batch();
  await new_batch();
  //await improve_resolution();
};

main();
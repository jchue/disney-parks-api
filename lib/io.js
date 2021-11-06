import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

dotenv.config();

const dataDirectory = './data';
const outputDirectory = './build';

/**
 * Extract data from file
 * @param {String} subdirectory - Path to the file
 * @param {String} file - File name
 * @returns {Object} - File data
 */
function parseFile(subdirectory, file) {
  // Remove ".md" from file name and append to subdirectory to get full slug
  const fileName = file.replace(/\.md$/, '');
  const slug = path.join(subdirectory, fileName === 'index' ? '' : fileName);

  // Read markdown file as string
  const fullPath = path.join(dataDirectory, subdirectory, file);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse post metadata
  const matterResult = matter(fileContents);

  // Combine data
  return {
    fileName,
    slug,
    ...matterResult.data,
    content: matterResult.content,
  };
}

/**
 * Parse all data files
 * @returns {Array} - All the parsed events
 */
function parseFiles() {
  const events = [];

  function recurseDir(subdirectory = '') {
    // Exclude dotfiles
    const fileNames = fs.readdirSync(
      path.join(dataDirectory, subdirectory),
      { withFileTypes: true },
    ).filter((dirent) => !(/^\..*/g).test(dirent.name));

    fileNames.forEach((dirent) => {
      if (dirent.isDirectory()) {
        recurseDir(path.join(subdirectory, dirent.name));
      } else {
        // Combine data
        events.push(parseFile(subdirectory, dirent.name));
      }
    });
  }

  recurseDir();

  return events;
}

/**
 * Create file in output directory
 * @param {String} slug - File slug
 * @param {String} fileName - File name
 * @param {String} data - File data
 */
function writeFile(slug, fileName, data) {
  const directoryArray = slug.split('/');
  if (fileName !== 'index') {
    directoryArray.pop();
  }

  const subdirectory = directoryArray.join('/');

  // Create directory if it doesn't exist
  if (!fs.existsSync(path.join(outputDirectory, subdirectory))) {
    fs.mkdirSync(path.join(outputDirectory, subdirectory), { recursive: true });
  }

  // Construct path
  const outputPath = path.join(outputDirectory, subdirectory, `${fileName}.json`);

  // Write file
  fs.writeFileSync(outputPath, data);
}

/**
 * Clear output directory
 */
function flush() {
  fs.rmdirSync(outputDirectory, { recursive: true });
}

export {
  flush,
  parseFiles,
  writeFile,
};

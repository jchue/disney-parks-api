import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

dotenv.config();

const dataDirectory = process.env.DATA_PATH;
const outputDirectory = process.env.OUTPUT_PATH;

function parseFiles() {
  const fileNames = fs.readdirSync(dataDirectory);
  const events = fileNames.map((fileName) => {
    // Remove ".md" from file name to get slug
    const slug = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(dataDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse post metadata
    const matterResult = matter(fileContents);

    // Combine data
    return {
      slug,
      ...matterResult.data,
      content: matterResult.content,
    };
  });

  return events;
}

function writeFile(filename, data) {
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDirectory)) fs.mkdirSync(outputDirectory);

  // Construct path
  const outputPath = path.join(outputDirectory, `${filename}.json`);

  // Write file
  fs.writeFileSync(outputPath, data);
}

export { parseFiles, writeFile };

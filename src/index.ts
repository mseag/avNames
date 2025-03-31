#!/usr/bin/env node
// Copyright 2025 SIL Global
import { CommanderError, program } from 'commander';
import * as config from './config.js';
import * as sanitize from './sanitize.js';
/*
import * as html from './html.js';
import * as img from './img.js';
*/
import fs from 'fs-extra';
import readline from 'readline';
import require from './cjs-require.js';

////////////////////////////////////////////////////////////////////
// Get parameters
////////////////////////////////////////////////////////////////////
program
//  .version(version, '-v, --version', 'output the current version')
  .description("Utility to rename audio files to have alphanumeric characters")
    .exitOverride();
try {
  program.parse();
} catch (error: unknown) {
  if (error instanceof CommanderError) {
    console.error(error.message);
  }
  process.exit(1);
}

// Debugging parameters
const options = program.opts();

if (!fs.existsSync('./samples')) {
  console.error(`samples/ doesn't exist`);
  process.exit(1)
}

////////////////////////////////////////////////////////////////////
// Routing commands to functions
////////////////////////////////////////////////////////////////////
const configJSON = `${process.cwd()}/config.json`;
const configFile = readJSON(configJSON);
config.validateFile(configFile);

// Clean previous output files and then copy samples/ to output/
fs.removeSync('./mapping.json', { force: true });
fs.removeSync('./output', { rescursive: true, force: true});
try {
  fs.copySync('./samples', './output', { recursive: true});
  console.info('Copied ./samples/ to ./output/');
} catch (err) {
  console.error(err);
  process.exit(1);
}

// Setup streams to read input fwdata file and write to output fwdata file
const inputFolder = `${process.cwd()}/samples/AudioVisual`
const inputStream = fs.createReadStream(`${inputFolder}/${configFile.fwdata}`);
const lineReader = readline.createInterface({
  input: inputStream,
  terminal: false
});

const outputFolder = `${process.cwd()}/output/AudioVisual`;
const outputStream = fs.createWriteStream(`${outputFolder}/${configFile.fwdata}`, {
  encoding: "utf8",
  flags: 'w' // overwrite
});

const s = new sanitize.Sanitize();
let numRenames = 0;


/// testing
//let test = '龙卷风🌪️';
//let testOut = s.convertAudioFileName(test);

console.info(`Processing...`);
// For each line in the original fwdata file
lineReader.on('line', function (line) {
  let out = s.sanitizeLine(line);
  // Write converted line
  outputStream.write(`${out.line}\n`);

  // Try to rename mp3/m4a files if they exist
  if (!(out.originalAudioName === out.newAudioName) &&
      fs.existsSync(`${outputFolder}/${out.originalAudioName}`)) {

    // Check if new name already exists
    if (fs.existsSync(`${outputFolder}/${out.newAudioName}`)) {
      console.error(`${out.originalAudioName} already exists. Exiting`);
      process.exit(1);
    }

    fs.renameSync(
      `${outputFolder}/${out.originalAudioName}`,
      `${outputFolder}/${out.newAudioName}`, function(err) {
        if (err) throw err;
      });
    numRenames++;
  }

  /*
  if (numRenames > configFile.stop!) {
    console.info(`Ending after ${numRenames} renames`);
    lineReader.close();
  }*/

})

// Post processing
inputStream.on('end', function() {
  // Write out mapping file
  s.writeMapping();

  let c = s.getMappingCount();
  console.info(`Converted ${c} filenames in fwdata, renamed ${numRenames} audio files.`);
  console.log('All done processing');
});


////////////////////////////////////////////////////////////////////
// Processor functions
////////////////////////////////////////////////////////////////////

function readJSON(file) {
  // Check if config.json file exists
  if (!fs.existsSync(file)) {
    console.error(`Can't open ${file}`);
    process.exit(1);
  };

  let obj;
  try {
    obj = require(file);
  } catch(e) {
    console.error(`Invalid JSON file ${file}. Exiting`);
    process.exit(1);
  }
  return obj;
}



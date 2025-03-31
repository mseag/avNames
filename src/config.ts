// Copyright 2025 SIL Global
import fs from 'fs-extra';

// Object to hold configuration parameters
export interface configType {
  fwdata: string; // Path to fwdata file
  stop?: number; // Stop after processing this many files
}

export function validateFile(configFile) {
  // Validate config file
  if (!configFile.fwdata) {
    console.error(`config file missing fwdata filename`);
    process.exit(1);
  }

  if (!fs.existsSync(`${process.cwd()}/samples/AudioVisual/${configFile.fwdata}`)) {
    console.error(`'${configFile.fwdata}' does not exist`)
    process.exit(1);
  }

  if (configFile.stop) {
    console.info(`Will stop after ${configFile.stop} audio files`);
  }
}

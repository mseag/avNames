// Copyright 2025 SIL Global

// Object to hold configuration parameters
export interface configType {
  fwdata: string; // Path to fwdata file
}

export function validateFile(configFile) {
  // Validate config file
  if (!configFile.fwdata) {
    console.error(`config file missing fwdata filename`);
    process.exit(1);
  }
}

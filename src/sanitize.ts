// Copyright 2025 SIL Global

import fs from 'fs-extra';
import require from './cjs-require.js';

export type sanitizeType = {
  line: string;

  originalAudioName?: string;
  newAudioName?: string;
}

export class Sanitize {
  mapping: any; // Store mapping of original to renamed files

  pinyin: any;

  constructor() {
    this.mapping = {}; // Mapping of old audio filenames to sanitized ones
    this.pinyin = require("chinese-to-pinyin"); // Converts Han script to pinyin
  }

  /**
   * Parse a line from the fwdata file
   * For an AudioVisual filename, convert the filename (.mp3 or .m4a) to alphanumeric 
   * and add to the map of original filenames to new filenames
   * @param {string} line - line from the fwdata file
   * @returns {sanitizeType} - Object of sanitized line information
   */
  public sanitizeLine(line: string) : sanitizeType {
    const AUDIO_VISUAL_REGEX = /^\<Uni\>AudioVisual\\(.*\.(mp3|m4a))\<\/Uni\>$/;

    let status : sanitizeType = {
      line: line
    };
    let match = status.line.match(AUDIO_VISUAL_REGEX);
    if (match) {
      let originalName = match[1];
      status.originalAudioName = originalName;

      // Sanitize audio filename
      let newName = this.convertAudioFileName(originalName);
      status.line = status.line.replace(originalName, newName);
      status.newAudioName = newName;
    }
    return status;
  }

  /**
   * Convert audio filename into alphanumeric characters
   * @param {string} name - original filename
   * @returns {string} - converted audio filename
   */
  public convertAudioFileName(name: string) : string {
    // Allowed mp3 filename characters
    const AUDIO_FILE_REGEX = /^[a-zA-z0-9\s\-\.]*\.(mp3|m4a)$/;
    const INVALID_CHARS_REGEX = /[^a-zA-z0-9\s\-\.]/;

    // Regex to test for special ranges
    const PUA_REGEX = /[\uF000-\uFFFF]/g; // Private Use Areae
    const HAN_REGEX = /\p{Script=Han}/u;  // Han script characters

    // Several Emoji ranges
    // https://stackoverflow.com/a/79511230
    const EMOJI_REGEX = /(?!(\*|#|\d))[\p{Extended_Pictographic}\p{Emoji_Component}]|[\u0030-\u0039]\ufe0f?[\u20e3]|[\u002A\u0023]?\ufe0f?[\u20e3]/gu;

    if (!name) {
      console.error(`audio filename undefined`);
      process.exit(1);
    }
  
    let newName = name;
    if (newName.match(AUDIO_FILE_REGEX)) {
      // Keep original name
      return newName;
    };

    //console.log(`Converting: ${newName}`);
    if (newName.match(PUA_REGEX)) {
      // Remove PUA chars
      //console.info(`removing PUA chars in ${newName}`);
      newName = newName.replace(PUA_REGEX, "");
      //console.info(`newName now: ${newName}`);
    }

    if (newName.match(EMOJI_REGEX)) {
      // Remove Emoji chars
      newName = newName.replace(EMOJI_REGEX, "");
    }

    if (newName.match(HAN_REGEX)) {
      // Convert Han script characters to pinyin (removing tones)
      //console.info(`converting CJK chars in ${newName}`);
      newName = this.pinyin(newName, { keepRest: true, removeTone: true});
      //console.info(`newName now: ${newName}`);
    }

    if (newName.match(INVALID_CHARS_REGEX)) {
      // Remove remaining invalid chars
      //console.warn(`newName still contains non-Latin chars: ${newName}`);
      newName = newName.replace(INVALID_CHARS_REGEX, "");
    }

    //  Add filename mapping
    this.mapping[name] = newName;
    return newName;
  }

  /**
   * Utility to write JSON object to file
   * @param {JSON} obj 
   * @param {string} filename 
   * @returns 
   */
  writeJSON(obj: any, filename : string) {
    if (Object.keys(obj)!.length == 0) {
      console.info(`object is empty. Not writing to ${filename}`);
      return;  
    }

    fs.writeFileSync('./' + filename, JSON.stringify(obj, null, 2));
    console.info(`Writing out "${filename}"`);
  }

  /**
   * Write out mapping to file
   */
  public writeMapping() {
    this.writeJSON(this.mapping, 'mapping.json');
  }

  /**
   * Return the mapping object
   * @returns {any}
   */
  public getMapping() {
    return this.mapping;
  }

  /**
   * Return the number of entries of renamed files
   * @returns {number}
   */
  public getMappingCount() : number {
    let count = (this.mapping && Object.keys(this.mapping)!.length > 0) ? 
        Object.keys(this.mapping)!.length : 0;
    return count;
  }
}
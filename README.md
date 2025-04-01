Utility to rename audio files to have alphanumeric characters and update references in fwdata file

Renamed folder is output/

## Configuration File

**Required**

config.json file in the same directory. This handles configuration 

```json
{
  "fwdata": "example.fwdata",
  "stop": 10
}
```

### config.json fields

The config.json file should have the following fields:

`fwdata': **Required**

: Location of the fwdata file currently expected in `./samples/AudioVisual/`.

`stop`: *Optional*

: Optional parameter to stop processing after this many renames. *Not yet implemented*

## Pre-requisites and Usage

Install the current LTS of [nodejs](https://nodejs.org/).

Install the dependencies with
```bash
npm install
```

Compile the project with
```bash
npm run build
```

Run the project with
```bash
node dist/index.js
```



## License
Copyright (c) 2025 SIL Global. All rights reserved. Licensed under the [MIT license](LICENSE).


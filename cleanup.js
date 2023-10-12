const core = require('@actions/core');
const io = require('@actions/io');
const fs = require('fs');

function getBoolValue(name) {
  return ['true', '1', 'yes', 'y'].includes(core.getInput(name).trim().toLowerCase())
}

async function main() {
  const errorless = getBoolValue('errorless');

  console.log(`=====> Keep git: ${getBoolValue('keepGit')}`);
  console.log(`=====> Errorless: ${errorless}`)

  try {
    const keepGit = getBoolValue('keepGit');
    await fs.readdir('.', (err, files) => deleteFiles(err, files, keepGit, errorless));
  } catch (error) {
    if (errorless) {
      core.warning(error.message);
    } else {
      core.setFailed(error.message);
    }
  }
}

async function deleteFiles(err, files, keepGit = false, errorless = false) {
  if (err) {
    throw new Error(`Failed to list files: ${err}`);
  }
  for (const file of files) {
    if (keepGit && file === '.git') {
      continue;
    }
    console.log(`Deleting ${file}`);

    try {
      await io.rmRF(file);
    } catch (error) {
      if (errorless) {
        console.log(`Failed to delete ${file}: ${error}`);
      } else {
        throw new Error(`Failed to delete ${file}: ${error}`);
      }
    }
  }
}

main()
  .then(() => console.log("Finished"))
  .catch(err => console.log(`Failed to delete files: ${err}`));

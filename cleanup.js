const core = require('@actions/core');
const io = require('@actions/io');
const fs = require('fs');

function getBoolValue(name) {
  return ['false', '0', '', 'no', 'n'].includes(core.getInput(name).trim().toLowerCase())
}

async function main() {
  const errorless = getBoolValue('errorless');

  console.log(`=====> Keep git: ${getBoolValue('keepGit')}`);
  console.log(`=====> Errorless: ${errorless}`)

  try {
    const keepGit = getBoolValue('keepGit');
    await fs.readdir('.', async (err, files) => {
      if (err) {
        throw new Error(`Failed to list files: ${err}`);
      }
      for (const file of files) {
        if (keepGit && file === '.git') {
          continue;
        }
        console.log(`Deleting ${file}`);
        await io.rmRF(file);
      }
    })
  } catch (error) {
    if (errorless) {
      core.warning(error.message);
    } else {
      core.setFailed(error.message);
    }
  }
}

main()
  .then(() => console.log("Finished"))
  .catch(err => console.log(`Failed to delete files: ${err}`));

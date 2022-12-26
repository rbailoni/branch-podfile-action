const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function fileExists(filePath) {
    return fs.promises.access(filePath)
    .then(() => {
        core.info(`File ${filePath} exists`);
        return true;
    })
    .catch(() => {
        core.setFailed(`File ${filePath} does not exist`);
        return false;
    });
}

(
    async () => {
        try {
            core.notice("Validating Podfile... ");
            const podPath = core.getInput('podfile-path');
            fileExists(podPath);
        } catch (error) {
            core.setFailed(error.message);
        }
    }
)();
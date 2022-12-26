const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const valueLines = [];

async function hasBranch() {
    const podPath = core.getInput('podfile-path');
    const isExist = await fileExists(filePath);
    if (isExist) {
        var numberLine = 1
        fs.promises.readFile(filePath, 'utf-8')
            .then(content => {
                content.split(/\r?\n/).forEach(text => {
                    if (text.indexOf(":branch") >= 0) {
                        valueLines.push(numberLine);
                    }
                    numberLine = numberLine + 1;
                });
                showResult();
            })
            .catch(() => {
                core.setFailed('Read File failed');
            })
    }
}

async function fileExists(filePath) {
    return fs.promises.access(filePath)
    .then(() => {
        return true;
    })
    .catch(() => {
        core.setFailed(`File ${filePath} does not exist`);
        return false;
    });
}

async function showResult() {
    if (valueLines.length > 0) {
        const token = core.getInput('repo-token');
        const podPath = core.getInput('podfile-path');
        core.setFailed("Validation did not pass");
        const octokit = new github.getOctokit(token);
        const check = await octokit.rest.checks.create({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            name: 'Podfile validation',
            head_sha: github.context.sha,
            status: 'completed',
            conclusion: 'failure',
            output: {
                title: "Podfile has :branch annotation",
                summary: "Please remove :branch annotation in Podfile",
                annotations: [
                    {
                        path: podPath,
                        start_line: valueLines[0],
                        end_line: valueLines[0],
                        annotation_level: 'failure',
                        message: "Podfile has :branch annotation"
                    }

                ]
            }
        });
    } else {
        core.notice("Validation pass");
    }
}

(
    async () => {
        try {
            core.notice("Validating Podfile... ");
            hasBranch();
        } catch (error) {
            core.setFailed(error.message);
        }
    }
)();
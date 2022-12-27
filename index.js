const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const valueLines = [];
const podPath = core.getInput('podfile-path');

async function hasBranch() {
    const isExist = await fileExists(podPath);
    if (isExist) {
        var numberLine = 1
        fs.promises.readFile(podPath, 'utf-8')
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
                core.setOutput('is-valide', false);
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
        core.setOutput('is-valide', false);
        core.setFailed(`File ${filePath} does not exist`);
        return false;
    });
}

async function showResult() {
    if (valueLines.length > 0) {
        const token = core.getInput('repo-token');
        const podPath = core.getInput('podfile-path');
        core.setOutput('is-valide', false);
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
                title: "Podfile has :branch statement",
                summary: "Please remove :branch statement in Podfile",
                annotations: await loadAnnotations()
            }
        });
    } else {
        core.setOutput('is-valide', true);
        core.notice("Validation OK");
    }
}

async function loadAnnotations() {
    var annotations = [];
    valueLines.forEach(numRow => {
        var annotation = {
            path: podPath,
            start_line: numRow,
            end_line: numRow,
            annotation_level: 'failure',
            message: "Podfile has :branch statement"
        };
        annotations.push(annotation);
    });
    return annotations;
}

(
    async () => {
        try {
            core.notice("Validating Podfile... ");
            hasBranch();
        } catch (error) {
            core.setOutput('is-valide', false);
            core.setFailed(error.message);
        }
    }
)();
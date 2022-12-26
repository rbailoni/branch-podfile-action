const core = require('@actions/core');
const github = require('@actions/github');


(
    async () => {
        try {
            const podPath = core.getInput('podfile-path')
            core.notice("Validating... " + podPath);
        } catch (error) {
            core.setFailed(error.message);
        }
    }
)();
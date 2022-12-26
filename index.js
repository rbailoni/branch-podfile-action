const core = require('@actions/core');
const github = require('@actions/github');


(
    async () => {
        try {
            core.notice("Validating Podfile...");
        } catch (error) {
            core.setFailed(error.message);
        }
    }
)();
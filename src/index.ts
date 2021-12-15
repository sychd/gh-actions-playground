import core from "@actions/core";
import github from "@actions/github";
import { getOctokitOptions } from "@actions/github/lib/utils";

(async () => {
  try {
    const token = core.getInput("repo-token");
    const { owner, repo } = github.context.repo;
    const prNumber = getPrNumber();
    if (!prNumber) {
      core.setFailed("Could not get pull request number from context");
    }

    const octokit = getOctokitOptions(token);

    const response = await octokit.pulls.get({
      owner: owner,
      repo: repo,
      pull_number: prNumber,
    });
    console.log({branchName: response.data.head.ref});

    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput("who-to-greet");
    console.log(`Hello ${nameToGreet}!`);
    const time = new Date().toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
  } catch (error: any) {
    core.setFailed(error?.message);
  }
})();

function getPrNumber() {
  const pullRequest = github.context.payload.pull_request;

  if (!pullRequest) {
    return undefined;
  }

  return pullRequest.number;
}

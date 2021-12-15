const core = require("@actions/core");
const github = require("@actions/github");
import { getOctokitOptions } from "@actions/github/lib/utils";

core.debug('hello -1');

(async () => {

  try {
    core.debug('hello 0');
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
  } catch (error: any) {
    core.debug('hello 1');
    core.setFailed(error.message);
  }
})();

function getPrNumber() {
  const pullRequest = github.context.payload.pull_request;

  if (!pullRequest) {
    return undefined;
  }

  return pullRequest.number;
}

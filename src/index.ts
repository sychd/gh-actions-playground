// some build issues with default imports, so aliases used as a workaround
import * as core from "@actions/core";
import * as github from "@actions/github";

(async () => {
  try {
    const details = getPRDetails();
    const inputs = getInputs();
    core.info(`PR Details: ${JSON.stringify(details)}`);
    core.info(`Inputs: ${JSON.stringify(inputs)}`);

  } catch (error: any) {
    core.setFailed(error?.message);
  }
})();

function getInputs() {
  return {
    token: core.getInput("repo-token"),
    shouldFailOnMismatch: core.getInput("repo-token"),
    headBranchRegex: core.getInput("head-branch-regex"),
    titleTemplate: core.getInput("title-template"),
    bodyTemplate: core.getInput("body-template"),
  };
}

function getPRDetails() {
  const {
    payload: { pull_request: pr },
  } = github.context;

  if (!pr) {
    return;
  }

  return {
    number: pr.number,
    body: pr.body || "",
    baseBranchName: pr.head.ref,
  };
}

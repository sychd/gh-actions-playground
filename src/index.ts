// some build issues with default imports, so aliases used as a workaround
import * as core from "@actions/core";
import * as github from "@actions/github";

const HEADER_PLACEHOLDER = "%headbranch%";

(async function main() {
  try {
    const details = getPRDetails();
    const inputs = getInputs();
    core.info(`PR Details: ${JSON.stringify(details, null, 2)}`);
    core.info(`Inputs: ${JSON.stringify(inputs, null, 2)}`);

    const request = getRequestBuilder();

    if (inputs.titleTemplate) {
      const matchedHeaderStr = getMatch(
        details?.baseBranchName,
        inputs.headBranchRegex,
        inputs.shouldFailOnMismatch
      );
      const injectedStr = inputs.titleTemplate.replace(HEADER_PLACEHOLDER, matchedHeaderStr).trim();

      request.setTitle(injectedStr ? injectedStr.concat(details?.title) : details?.title);
    }

    const octokit = github.getOctokit(inputs.token);
    const response = await octokit.rest.pulls.update(request.build());

    core.info(`Response: ${response.status}`);
    if (response.status !== 200) {
      core.error("Updating the pull request has failed");
    }
  } catch (error: any) {
    core.setFailed(error?.message);
  }
})();

function getRequestBuilder() {
  const request: any = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context!.payload!.pull_request!.number,
  };

  const obj = {
    setTitle: (title: string) => {
      request.title = title;
      return obj;
    },
    build: () => request,
  };

  return obj;
}

function getMatch(str: string, regex: string, failOnMismatch: boolean): string {
  if (regex) {
    const [baseMatch = ""] = str.match(new RegExp(regex)) || [];

    if (baseMatch) {
      core.info(`Matched text: ${baseMatch}`);
    } else if (failOnMismatch) {
      core.setFailed(`String "${str}" does not match given regex "${regex}"`);
    }

    return baseMatch;
  }

  return "";
}

function getInputs() {
  return {
    token: core.getInput("repo-token"),
    shouldFailOnMismatch: !!core.getInput("fail-on-pattern-mismatch"),
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
    title: pr.title,
  };
}

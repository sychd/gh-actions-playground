// some build issues with default imports, so aliases used as a workaround
import * as core from "@actions/core";
import * as github from "@actions/github";

// TODO: replace all 'any' types
// TODO: add tests

const HEAD_BRANCH_PLACEHOLDER = "%headbranch%";

(async function main() {
  try {
    const details = getPRDetails();
    const inputs = getInputs();
    const request = getRequestBuilder();

    core.info(`PR Details: ${JSON.stringify(details, null, 2)}`);
    core.info(`Inputs: ${JSON.stringify(inputs, null, 2)}`);

    const matchedHeaderStr = getMatch(
      details.baseBranchName,
      inputs.headBranchRegex,
      inputs.shouldFailOnMismatch
    );

    if (inputs.titleTemplate) {
      const injectedStr =
        inputs.titleTemplate.includes(HEAD_BRANCH_PLACEHOLDER) && matchedHeaderStr
          ? inputs.titleTemplate.replace(HEAD_BRANCH_PLACEHOLDER, matchedHeaderStr)
          : inputs.titleTemplate;

      request.setTitle(injectedStr.concat(details?.title));
    }
    if (inputs.bodyTemplate) {
      const injectedStr =
        inputs.bodyTemplate.includes(HEAD_BRANCH_PLACEHOLDER) && matchedHeaderStr
          ? inputs.bodyTemplate.replace(HEAD_BRANCH_PLACEHOLDER, matchedHeaderStr)
          : inputs.bodyTemplate;

      request.setBody(injectedStr.concat("\n").concat(details?.body));
    }

    await updatePR(inputs.token, request.build());
  } catch (error: any) {
    core.setFailed(error?.message);
  }
})();

async function updatePR(token: string, payload: any) {
  const octokit = github.getOctokit(token);
  const response = await octokit.rest.pulls.update(payload);

  core.info(`Response: ${response.status}`);
  if (response.status !== 200) {
    core.error("Updating the pull request has failed");
  }
}

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
    setBody: (body: string) => {
      request.body = body;
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
    throw Error("PR details are absent. Please, use this Action only for PRs.");
  }

  return {
    number: pr.number,
    body: pr.body || "",
    baseBranchName: pr.head.ref,
    title: pr.title,
  };
}

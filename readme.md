# Update PR action 
Inspired from [GH action](https://github.com/tzkhan/pr-update-action)  created by [@tzkhan](https://github.com/tzkhan).

This is a GitHub Action that updates a pull request with information extracted from head branch name.
PR's body and title can be prefixed with desired text.

## Inputs
### Required
- repo-token: secret token to allow making calls to GitHub's rest API (for e.g. `${{ secrets.GITHUB_TOKEN }}`)

### Optional
- fail-on-pattern-mismatch: should action fail if regex didn't match
- head-branch-regex: regex to match text from the head branch name
- title-template: text template to update title with
- body-template: text template to update body with

## Example usage
Create a workflow yaml file (for e.g. `.github/workflows/update-pr.yml`). See [Creating a Workflow file](https://docs.github.com/en/free-pro-team@latest/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow).

```yaml
name: PR updater

on:
  pull_request:
    types: [opened]
    branches-ignore:
      - "dependabot-npm_and_yarn-*"

jobs:
  update_pull_request:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Updates Pull Request information
        uses: dsych/update-pr-action@v1.1
        with:
          repo-token: "${{ github.token }}"
          head-branch-regex: "(CW|cw)-[0-9]+"
          title-template: "[%headbranch%] "
          body-template: |
              ## :eyes: Jira Ticket: %headbranch%
              :framed_picture: Deploy Preview: https://pr-${{ github.event.number }}.test.co/
```

## Development

1. Perform changes
2. Run `npm run build` before commit
3. Commit changes and modified by previous command `/dist` folder

Before committing stick to [these](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github) and [these recommendations ](https://docs.github.com/en/actions/creating-actions/about-custom-actions#using-release-management-for-actions):

Use tags:
   ```
      git tag -a -m "Descrption of the release" v1.1
      git push --follow-tags
      ```

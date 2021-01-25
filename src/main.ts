import * as core from '@actions/core';
import * as github from '@actions/github';

const jiraRegex = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)\s.+/gm;

const ignoreBranch = (branch: string, ignoreBranchTerms: string[]) => {
  for (let i = 0; i < ignoreBranchTerms.length; i++) {
    const branchTerm = ignoreBranchTerms[i];

    if (branch.startsWith(branchTerm)) {
      return true;
    }
  }

  return false;
};

const errorMessage = `Please make sure that the PR title follows the standard PRISM-XXXX - My PR Title

* All letters of PRISM must be in uppercase
* At least one blank space must be left after the number
* All PRs must have an according JIRA ticket (at the exception of dependabot)`;

async function run(): Promise<void> {
  try {
    const github_token = core.getInput('GITHUB_TOKEN', {required: true});
    const octokit = new github.GitHub(github_token);
    const ignoreBranchTerms = core.getInput('branch-term-whitelist').split(',');

    const context = github.context;

    const pullRequest = context.payload.pull_request;

    if (pullRequest == null) {
      core.setFailed('No pull request found.');
      return;
    }

    const pull_request_number = pullRequest.number;
    const branch = pullRequest.head.ref.replace('refs/heads/', '');

    core.debug(`branch -> ${branch}`);
    core.debug(`ignoreBranchTerms -> ${ignoreBranchTerms}`);

    if (ignoreBranch(branch, ignoreBranchTerms)) {
      core.debug(
        `branch is in the whitelist -> ${branch} ${ignoreBranchTerms}`
      );
    } else {
      const title = pullRequest.title;
      

      core.debug(`title -> ${title}`);
      

      if (!jiraRegex.test(title)) {


        core.setFailed(errorMessage);


        await octokit.issues.createComment({
          ...context.repo,
          issue_number: pull_request_number,
          body: errorMessage
        });
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

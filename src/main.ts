import * as core from '@actions/core';
import * as github from '@actions/github';

const ignoreBranchTerms = ['dependabot'];

const ignoreBranch = (branch: string, ignoreBranchTerms: string[]) => {
  for (let i = 0; i < ignoreBranchTerms.length; i++) {
    const branchTerm = ignoreBranchTerms[i];

    if (branch.startsWith(branchTerm)) {
      return true;
    }
  }

  return false;
};

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
    const title = pullRequest.title;
    const branch = context.ref;

    if (
      !/^((?<!([A-Z])-?)[A-Z]+-\d+)/.test(title) &&
      !ignoreBranch(branch, ignoreBranchTerms)
    ) {
      const body = `PR title must start with a valid JIRA ticket number (COVID-19)`;

      await octokit.issues.createComment({
        ...context.repo,
        issue_number: pull_request_number,
        body
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

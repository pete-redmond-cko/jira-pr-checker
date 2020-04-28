import * as core from '@actions/core';
import * as github from '@actions/github';

const jiraRegex = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)/gm;

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
    const branch = context.ref;

    if (!ignoreBranch(branch, ignoreBranchTerms)) {
      const title = pullRequest.title;
      const body = pullRequest.body;

      core.debug(`title -> ${title}`);
      core.debug(`body -> ${body}`);

      if (!jiraRegex.test(title) && !jiraRegex.test(body!)) {
        core.setFailed('PR must include a valid JIRA ticket (COVID-19)');
        await octokit.issues.createComment({
          ...context.repo,
          issue_number: pull_request_number,
          body: 'PR must include a valid JIRA ticket (COVID-19)'
        });
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

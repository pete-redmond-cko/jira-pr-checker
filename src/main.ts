import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const github_token = core.getInput('GITHUB_TOKEN');
    const octokit = new github.GitHub(github_token);

    const context = github.context;

    if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.');
      return;
    }

    const pull_request_number = context.payload.pull_request.number;
    const title = context.payload?.pull_request?.title;

    const body = `PR title is: ${title}`;

    await octokit.issues.createComment({
      ...context.repo,
      issue_number: pull_request_number,
      body
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

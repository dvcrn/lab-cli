const config = require('../lib/config');

const ajax = require('../lib/ajax');
const help = require('../lib/help');
const git = require('../lib/git');

function createMr(project, base, from, title) {
  const projects = config.get('projects');
  if (projects[project] === undefined) {
    console.error(`The project ${project} does not exist.`);
    return;
  }

  const endpoint = "projects/" + projects[project] + "/merge_requests";
  const payload = {
    target_branch: base,
    source_branch: from,
    title: title,
  };

  const response = ajax.postRequest(endpoint, payload);
  if (response.jsonBody === null || !response.jsonBody["iid"]) {
    console.error("Couldn't create merge request.");
    return;
  }

  const url = "https://" + config.get('domain') + "/" + project + "/merge_requests/" + response.jsonBody["iid"];
  console.info("Merge request created: " + url);
  return;
}

function mergeRequest(base, from, title) {
  if (arguments.length <= 1) {
    console.info("Not enough arguments");
    console.info("");
    help.printUsage();
    return;
  }

  // Allow to omit base branch and auto set it to master
  if (arguments.length === 2) {
    title = from;
    from = base;
    base = 'master';
  }

  git.isGitRepository(function(status) {
    if (!status) {
      console.error("not inside a git repository");
      return;
    }

    git.getRepositoryFromGit(function(project) {
      return createMr(project.toLowerCase(), base, from, title);
    });
  });
}

module.exports = {
  fx: mergeRequest,
  cmd: "lab mr|merge-request base_branch=master source_branch title",
  desc: "Creates a new merge request from source_branch -> base_branch. Takes the project from git config."
}

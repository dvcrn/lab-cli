const config = require('./config');
const exec = require('child_process').exec;

function isGitRepository(cb) {
  exec('git status', (err, _stdout, _stderr) => {
    if (err) {
      cb(false);
    } else {
      cb(true);
    }
  });
}

function getRepositoryFromGit(cb) {
  const domain = config.get('domain');
  // replace dots with escaped dots for regex use
  const domainRegex = domain.replace(/\./g, '\\.');

  const regex = `${domainRegex}\\:?\\/?([a-zA-Z0-9_\-]*\\/[a-zA-Z0-9_\\-]*)`;
  const strip = `sed s/${domain}:// | sed s-${domain}/--`;
  const command = `git config --get remote.origin.url | grep -oE "${regex}" | ${strip}`;

  exec(command, (err, stdout, _stderr) => {
    if (err) {
      cb(null);
    } else {
      cb(stdout.trim());
    }
  });
}

function getBranchFromGit(cb) {
  const command = "git branch | grep '*' | sed 's/\\* //'";

  exec(command, (err, stdout, _stderr) => {
    if (err) {
      console.info(err);
      cb(null);
    } else {
      cb(stdout.trim());
    }
  });
}

module.exports = {
  isGitRepository: isGitRepository,
  getRepositoryFromGit: getRepositoryFromGit,
  getBranchFromGit: getBranchFromGit,
}

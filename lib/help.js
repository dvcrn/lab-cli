const mr = require("../commands/merge-request");

function printUsage() {
  const projects = [mr];

  console.info("Usage:");
  for (var project of projects) {
    console.info("  " + project.cmd);

    for (var description of project.desc) {
      console.info("    | " + description);
    }

    console.info("");
  }

  console.info("more coming soon (maybe)");
}

module.exports.printUsage = printUsage

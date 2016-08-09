const mr = require("../commands/merge-request");

function printUsage() {
  const projects = [mr];

  console.info("Usage:");
  for (var project in projects) {
    console.info("  " + mr.cmd);
    console.info("    | -> " + mr.desc);
    console.info("");
  }

  console.info("more coming soon (maybe)");
}

module.exports.printUsage = printUsage

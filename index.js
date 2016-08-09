#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const untildify = require('untildify');

const help = require('./lib/help');
const ajax = require('./lib/ajax');
const git = require('./lib/git');

const config = require('./lib/config');

const mergeRequest = require('./commands/merge-request');


let arg = {
  command: null,
  params: null,
  project: null,
}

function parseProjects(projectArray) {
  const projects = {};
  for (let project in projectArray) {
    project = projectArray[project];
    projects[project.path_with_namespace.toLowerCase()] = project.id;
  }

  return projects;
}

function onConfigRead(err, data) {
  if (err !== null) {
    console.error("No ~/.labrc found. Please create one first.");
    return;
  }

  let parsedJSON;
  try {
    parsedJSON = JSON.parse(data);
  } catch (e) {
    console.error("~/.labrc malformated. It has to be valid JSON.");
    return;
  }

  config.set("access_token", parsedJSON["access_token"]);
  config.set("domain", parsedJSON["domain"]);

  const response = ajax.getRequest("projects", {per_page: 100});
  if (response.statusCode !== 200) {
    console.error("Couldnt connect to server. Check your config.");
    return;
  }

  const projects = parseProjects(response.jsonBody)
  config.set('projects', projects);

  if (projects.length < 1) {
    console.error("no projects found in your gitlab. please create some first");
    return;
  }

  switch (arg.command) {
    case 'merge-request':
      mergeRequest.fx.apply(this, arg.params);
      break;

    case 'mr':
      mergeRequest.fx.apply(this, arg.params);
      break;

    default:
      console.error("command " + arg.command + " does not exist.");
  }
}

if (process.argv.length < 4) {
  help.printUsage();
  return;
}

arg.command = process.argv[2];
arg.params = process.argv.slice(3)

fs.readFile(untildify("~/.labrc"), {
  encoding: "utf-8"
}, onConfigRead);


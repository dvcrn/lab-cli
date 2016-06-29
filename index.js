#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const untildify = require('untildify');
const request = require('sync-request');
const ora = require('ora');

let config = {};
let arg = {
  command: null,
  params: null,
  project: null,
}
let projects = {};

function parseProjects(projectArray) {
  for (let project in projectArray) {
    project = projectArray[project];
    projects[project.path_with_namespace.toLowerCase()] = project.id;
  }
}

function printUsage() {
  console.error("Usage:");
  console.error("    lab merge-request my/project base_branch=master source_branch title");
  console.error("");
  console.error("more coming soon (maybe)");
}

function constructRequest(type, endpoint, data) {

  let getQuery = "";
  if (data !== undefined && Object.keys(data).length > 0) {
    const tmp = [];
    for (var key in data) {
      tmp.push(key + "=" + data[key]);
    }
    getQuery = tmp.join('&');
  }

  let url = "https://" + config["domain"] + "/api/v3/" + endpoint + "?private_token=" + config["access_token"];

  let response;
  if (type.toLowerCase() === 'get') {
    url = url + "&" + getQuery;
    response = request(type, url);
  } else if (type.toLowerCase() === 'post') {
    response = request(type, url, {json: data});
  }

  response.jsonBody = null;
  try {
    response.jsonBody = JSON.parse(response.getBody("utf-8"));
  } catch (e) {
    // ignore
  }

  return response;
}

function getRequest(endpoint, params) {
  return constructRequest("GET", endpoint, params);
}

function postRequest(endpoint, params) {
  return constructRequest("POST", endpoint, params);
}

function mergeRequest(base, from, title) {
  if (arguments.length <= 1) {
    printUsage();
    return;
  }

  if (arguments.length === 2) {
    title = from;
    from = base;
    base = 'master';
  }

  const endpoint = "projects/" + projects[arg.project] + "/merge_requests";
  const payload = {
    target_branch: base,
    source_branch: from,
    title: title,
  };

  const response = postRequest(endpoint, payload);
  if (response.jsonBody === null || !response.jsonBody["id"]) {
    console.error("Couldn't create merge request.");
    return;
  }

  const url = "https://" + config.domain + "/" + arg.project + "/merge_requests/" + response.jsonBody["id"];
  console.info("Merge request created: " + url);
  return;
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

  config["access_token"] = parsedJSON["access_token"];
  config["domain"] = parsedJSON["domain"];

  const response = getRequest("projects", {per_page: 100});
  if (response.statusCode !== 200) {
    console.error("Couldnt connect to server. Check your config.");
    return;
  }

  parseProjects(response.jsonBody);

  if (projects.length < 1) {
    console.error("no projects found in your gitlab. please create some first");
    return;
  }

  if (projects[arg.project] === undefined) {
    console.error("project '" + arg.project + "' not found in your gitlab projects.");
    return;
  }

  switch (arg.command) {
    case 'merge-request':
      mergeRequest.apply(this, arg.params);
      break;

    default:
      console.error("command " + arg.command + " does not exist.");
  }
}

if (process.argv.length < 4) {
  printUsage();
  return;
}

arg.command = process.argv[2];
arg.project = process.argv[3];
arg.params = process.argv.slice(4)


fs.readFile(untildify("~/.labrc"), {
  encoding: "utf-8"
}, onConfigRead);


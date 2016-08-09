const request = require('sync-request');
const config = require('../lib/config');

function constructRequest(type, endpoint, data) {
  let getQuery = "";
  if (data !== undefined && Object.keys(data).length > 0) {
    const tmp = [];
    for (var key in data) {
      tmp.push(key + "=" + data[key]);
    }
    getQuery = tmp.join('&');
  }

  let url = "https://" + config.get("domain") + "/api/v3/" + endpoint + "?private_token=" + config.get("access_token");

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


module.exports = {
  getRequest: getRequest,
  postRequest: postRequest,
}

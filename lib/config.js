let config = {}

function get(key) {
  return config[key];
}

function set(key, value) {
  return config[key] = value;
}

module.exports = {
  get: get,
  set: set,
};

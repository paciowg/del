const request = require('request-promise-native');

async function putResource(url, resource) {
  const resourceUrl = `${url}/${resource.resourceType}/${resource.id}`;

  console.log('Sending', resourceUrl);

  return request({
    method: 'PUT',
    uri: resourceUrl,
    body: resource,
    json: true,
    headers: {},
  });
}

function logError(error) {
  if (error.error && error.error.issue) {
    for (const issue of error.error.issue) {
      console.log(issue);
    }
  } else {
    console.error(error);
  }
}

function groupBy(data, field) {
  const groups = {};

  for (const item of data) {
    const list = groups[item[field]];
    if (list) {
      list.push(item);
    } else {
      groups[item[field]] = [item];
    }
  }
  return groups;
}

module.exports = { putResource, logError, groupBy };

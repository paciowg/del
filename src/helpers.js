const request = require('request-promise-native');

const { RESPONSES_SQL } = require('./sql');

let RESPONSE_MAP = null;

async function putResource(url, resource) {
  const resourceUrl = `${url}/${resource.resourceType}/${resource.id}`;

  console.log(resourceUrl);

  const response = await request({
    method: 'PUT',
    uri: resourceUrl,
    body: resource,
    json: true,
    headers: {},
    resolveWithFullResponse: true
  });

  return response.body;
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

/**
 * The query result is a flat list with these columns:
 *   asmtid, questionid, responseid, responsecode, responsetext
 *
 * Convert it to a nested mapping that looks like this:
 * {
 *   asmtid: {
 *     questionid: [
 *       { responseid, responsecode, responsetext },
 *       { responseid, responsecode, responsetext },
 *     ],
 *     ...
 *   },
 *   ...
 * }
 *
 * That way you can look it up like this: mapping[asmtid][questionid]
 *
 * Cache the results cause this could be slow-ish.
 */
async function getResponseMap(client) {
  if (RESPONSE_MAP) {
    return RESPONSE_MAP;
  }

  RESPONSE_MAP = {};

  const result = await client.query(RESPONSES_SQL);

  let asmtobj;
  let questionlist;
  for (const row of result.rows) {
    if (!RESPONSE_MAP[row.asmtid]) {
      RESPONSE_MAP[row.asmtid] = {};
      asmtobj = RESPONSE_MAP[row.asmtid];
    }

    if (!asmtobj[row.questionid]) {
      asmtobj[row.questionid] = [];
      questionlist = asmtobj[row.questionid];
    }

    questionlist.push({
      responseid: row.responseid,
      responsecode: row.responsecode,
      responsetext: row.responsetext,
    });
  }

  return RESPONSE_MAP;
}

module.exports = { putResource, logError, getResponseMap };

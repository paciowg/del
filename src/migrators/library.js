const { writeFileSync } = require('fs');
// const groupBy = require('lodash.groupby');

const { LIBRARIES_SQL } = require('../sql');

function buildLibrary({
  asmtid, version, status, date, name, description, title, publisher, startdate, enddate, approvaldate
}) {
  const resource = {
    resourceType: 'Library',
    id: `Questionnaire-${asmtid}`,
    url: `http://cms.gov/impact/Library/${asmtid}`,
    text: {
      status: 'generated',
      div: `<div xmlns="http://www.w3.org/1999/xhtml">${name} standard form version ${version}.<br/><br/>${description}</div>`
    },
    version,
    status, // active, draft, retired
    name,
    title,
    type: {
      coding: [{
        code: 'asset-collection', // logic-library, model-definition, asset-collection, module-definition,
      }],
    },
    date, // date last changed
    publisher,
    description,
  };
  return resource;
}

/**
 * Build all libraries and return them as a list of objects.
 *
 * @param {import('pg').Client} client
 */
async function run(client) {
  const libraryResults = await client.query(LIBRARIES_SQL);

  const output = [];

  for (const row of libraryResults.rows) {
    const library = buildLibrary(row);

    output.push(library);

    writeFileSync(`out/json/libraries/${library.id}.json`, JSON.stringify(library, null, 2));
  }

  return output;
}

module.exports = { run };

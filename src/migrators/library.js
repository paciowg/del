const { getAllLibraries } = require('../sql');

function buildLibrary(baseUrl, {
  asmtid, version, status, date, name, description, title, publisher, startdate, enddate, approvaldate
}) {
  const resource = {
    resourceType: 'Library',
    id: `Questionnaire-${asmtid}`,
    url: `${baseUrl}/Library/Questionnaire-${asmtid}`,
    meta: {
      profile: `${baseUrl}/StructureDefinition/del-StandardFormLibrary`
    },
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
    effectivePeriod: { start: startdate }
  };

  if (approvaldate) {
    resource.approvalDate = approvaldate;
  }

  if (enddate && enddate > startdate) {
    resource.effectivePeriod.end = enddate;
  }

  return resource;
}

/**
 * Build all libraries and return them as a list of objects.
 *
 * @param {string} url
 * @param {import('pg').Client} client
 */
async function run(url, client) {
  const libraryResults = await getAllLibraries(client);

  const output = [];

  for (const row of libraryResults) {
    const library = buildLibrary(url, row);

    output.push(library);
  }

  return output;
}

module.exports = { run };

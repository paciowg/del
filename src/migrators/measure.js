const { writeFileSync } = require('fs');
// const groupBy = require('lodash.groupby');

const { getAllMeasures } = require('../sql');

function buildMeasure(baseUrl, { questionid, label, name, text, }) {
  name = name.trim();
  label = label.trim();
  text = text.trim();

  // TODO: put choices in here as well
  const description = `## ${label}\n\n${text}`;

  // TODO: Link back to all questionnaires where this question is used!
  const library = [];

  const resource = {
    resourceType: 'Measure',
    id: `Question-${label}`,
    url: `${baseUrl}/Measure/Question-${label}`,
    text: {
      status: 'generated',
      div: `<div xmlns="http://www.w3.org/1999/xhtml">${label} - ${name.replace('&', '&amp;')}<br/><br/>${text.replace('&', '&amp;')}</div>`
    },
    name: `Question_${label}`,
    title: name,
    status: 'active',
    description: description,
  };

  return resource;
}

/**
 * Build all measures and return them as a list of objects.
 *
 * @param {string} url
 * @param {import('pg').Client} client
 */
async function run(url, client) {
  const measureResults = await getAllMeasures(client);

  const output = [];

  for (const row of measureResults) {
    const measure = buildMeasure(url, row);
    output.push(measure);
  }

  return output;
}

module.exports = { run };

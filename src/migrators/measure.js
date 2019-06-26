const { writeFileSync } = require('fs');
// const groupBy = require('lodash.groupby');

const { MEASURES_SQL } = require('../sql');

function buildMeasure({ questionid, label, name, text, }) {
  name = name.trim();
  label = label.trim();
  text = text.trim();

  // TODO: put choices in here as well
  const description = `## ${label}\n\n${text}`;

  // TODO: Link back to all questionnaires where this question is used!
  const library = [];

  const resource = {
    resourceType: 'Measure',
    url: `http://cms.gov/impact/Measure/${label}`,
    text: {
      status: 'generated',
      div: `<div xmlns="http://www.w3.org/1999/xhtml">${label} - ${name.replace('&', '&amp;')}<br/><br/>${text.replace('&', '&amp;')}</div>`
    },
    id: `Question-${label}`,
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
 * @param {import('pg').Client} client
 */
async function run(client) {
  const questionResults = await client.query(MEASURES_SQL);
  // const groupedQuestions = groupBy(questionResults.rows, 'asmtid');

  const output = [];

  for (const row of questionResults.rows) {
    const measure = buildMeasure(row);

    output.push(measure);

    writeFileSync(`out/json/measures/${measure.id}.json`, JSON.stringify(measure, null, 2));
  }

  return output;
}

module.exports = { run };

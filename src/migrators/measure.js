const { getAllMeasures, getGroupedQuestions } = require('../sql');

function buildMeasure(baseUrl, { questionid, label, name, text, }, questionnaireMap) {
  name = name.trim();
  label = label.trim();
  text = text.trim();

  // TODO: put choices in here as well?
  const description = `## ${label}\n\n${text}`;

  // Link back to all questionnaires where this question is used!
  let library = [];
  const questionnaires = questionnaireMap[questionid];
  if (questionnaires) {
    library = questionnaires.asmtid.map(asmt => `Library/Questionnaire-${asmt}`);
  }

  // TODO: Figure out where to store responses and put them there!

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
    library,
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

  const questionnaireMap = await getGroupedQuestions(client, ['questionid'], ['asmtid']);

  const output = [];

  for (const row of measureResults) {
    const measure = buildMeasure(url, row, questionnaireMap);
    output.push(measure);
  }

  return output;
}

module.exports = { run };

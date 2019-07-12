const { getAllMeasures, getGroupedQuestions, getGroupedResponses } = require('../sql');

function buildMeasure(baseUrl, { questionid, label, name, text, }, questionnaireMap, responseMap) {
  name = name.trim();
  label = label.trim();
  text = text.trim();

  let description = `${label} - ${text}`;

  // Link back to all questionnaires where this question is used!
  let library = [];
  const questionnaires = questionnaireMap[questionid];
  if (questionnaires) {
    library = questionnaires.asmtid.map(asmt => `Library/Questionnaire-${asmt}`);
  }

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

  // Put all possible responses in supplementalData.
  const responses = responseMap[questionid];
  if (responses) {
    resource.relatedArtifact = responses.filter(r => r.responsecode && r.responsetext).map(r => ({
      type: 'documentation',
      resource: `Library/Questionnaire-${r.asmtid}`,
      label: r.responsecode,
      display: r.responsetext,
    }));
  }

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
  const responseMap = await getGroupedResponses(client, ['questionid']);

  const output = [];

  for (const row of measureResults) {
    const measure = buildMeasure(url, row, questionnaireMap, responseMap);
    output.push(measure);
  }

  return output;
}

module.exports = { run };

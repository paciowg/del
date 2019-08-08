const { getAllMeasures, getGroupedQuestions, getGroupedResponses, getGroupedLoincCodes } = require('../sql');

function buildMeasure(profileUrl, serverUrl, { questionid, label, name, text, }, questionnaireMap, responseMap, loincMap) {
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
    url: `${serverUrl}/Measure/Question-${label}`,
    meta: {
      profile: `${profileUrl}/StructureDefinition/del-StandardFormQuestion`
    },
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
    resource.relatedArtifact = [];

    for (const response of responses) {
      if (response.responsecode && response.responsetext) {
        const obj = {
          type: 'documentation',
          resource: `Library/Questionnaire-${response.asmtid}`,
          label: response.responsecode,
          display: response.responsetext,
        };

        // If loinc code exists, it should be a one-element array.
        if (loincMap[questionid] && loincMap[questionid][response.asmtid]) {
          const loinc = loincMap[questionid][response.asmtid][0];
          obj.url = `https://details.loinc.org/LOINC/${loinc.loinccode}.html#${loinc.latestversion}`;
        }

        resource.relatedArtifact.push(obj);
      }
    }
  }

  return resource;
}

/**
 * Build all measures and return them as a list of objects.
 *
 * @param {String} profileUrl
 * @param {String} serverUrl
 * @param {import('pg').Client} client
 */
async function run(profileUrl, serverUrl, client) {
  const measureResults = await getAllMeasures(client);

  const questionnaireMap = await getGroupedQuestions(client, ['questionid'], ['asmtid']);
  const responseMap = await getGroupedResponses(client, ['questionid']);
  const loincMap = await getGroupedLoincCodes(client, ['questionid', 'asmtid']);

  const output = [];

  for (const row of measureResults) {
    const measure = buildMeasure(profileUrl, serverUrl, row, questionnaireMap, responseMap, loincMap);
    output.push(measure);
  }

  return output;
}

module.exports = { run };

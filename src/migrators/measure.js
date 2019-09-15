const {
    getAllMeasures,
    getGroupedQuestions,
    getGroupedResponses,
    getLoincCode,
} = require('../sql');

function buildMeasure(
    profileUrl,
    serverUrl,
    { questionid, label, name, text },
    questionnaireMap,
    responseMap
) {
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
            profile: `${profileUrl}/StructureDefinition/del-StandardFormQuestion`,
        },
        text: {
            status: 'generated',
            div: `<div xmlns="http://www.w3.org/1999/xhtml">${label} - ${name.replace('&', '&amp;')}<br/><br/>${text.replace('&', '&amp;')}</div>`,
        },
        name: `Question_${label}`,
        title: name,
        status: 'active',
        description: description,
        library,
    };

    // TODO: Figure out how to get this here. Question is not tied to assessment here.
    // const loinc = getLoincCode('question', asmtid);
    // if (loinc) {
    //     resource.identifier = [
    //         {
    //             code: 'official',
    //             system: loinc.system,
    //             value: loinc.code,
    //         },
    //     ];
    // }

    // Put all possible responses in supplementalData.
    const responses = responseMap[questionid];
    if (responses) {
        resource.relatedArtifact = [];

        for (const response of responses) {
            if (response.responsecode && response.responsetext) {
                // Add the link for this specific questionnaire.
                const obj = {
                    type: 'documentation',
                    resource: `Library/Questionnaire-${response.asmtid}`,
                    label: response.responsecode,
                    display: response.responsetext,
                };

                // Add the LOINC code for this if it exists.
                const loinc = getLoincCode('response', response.asmtid, questionid, response.responseid, response.responsevalueid);
                if (loinc) {
                    obj.url = `https://loinc.org/${loinc.code}`;
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

    const output = [];

    for (const row of measureResults) {
        const measure = buildMeasure(profileUrl, serverUrl, row, questionnaireMap, responseMap);
        output.push(measure);
    }

    return output;
}

module.exports = { run };

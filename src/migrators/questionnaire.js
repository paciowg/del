const sortBy = require('lodash.sortby');

const {
    getAllQuestionnaires,
    getGroupedQuestions,
    getGroupedResponses,
    getLoincCode,
} = require('../sql');

function buildQuestionnaire(
    profileUrl,
    serverUrl,
    { asmtid, version, status, date, name, description, title, publisher, startdate, enddate, approvaldate },
) {
    const resource = {
        resourceType: 'Questionnaire',
        id: asmtid,
        url: `${serverUrl}/Questionnaire/${asmtid}`,
        meta: {
            profile: `${profileUrl}/StructureDefinition/del-StandardForm`,
        },
        text: {
            status: 'generated',
            div: `<div xmlns="http://www.w3.org/1999/xhtml">${name} standard form version ${version}.<br/><br/>${description}</div>`,
        },
        status, // active, draft, retired
        date, // date last changed
        name,
        version,
        publisher,
        title,
        description,
        effectivePeriod: { start: startdate },
    };

    const loinc = getLoincCode('questionnaire', asmtid);
    if (loinc) {
        resource.code = [loinc];
    }

    if (approvaldate) {
        resource.approvalDate = approvaldate;
    }

    if (enddate && enddate > startdate) {
        resource.effectivePeriod.end = enddate;
    }

    return resource;
}

function buildQuestion({ asmtid, questionid, datatype, label, sectionid, text, typename, maxlength }, responses) {
    let type = 'group';
    if (datatype === 'character') type = 'text';
    if (datatype === 'number') type = 'integer';
    if (datatype === 'date') type = 'open-choice';

    const item = {
        linkId: `Section-${sectionid}/${label}`,
        prefix: label,
        text: text.trim(),
        type,
        repeats: typename == 'checklist',
        readOnly: type === 'group',
    };

    const loinc = getLoincCode('question', asmtid, questionid);
    if (loinc) {
        item.code = [loinc];
    }

    if (responses) {
        const options = [];
        // Loop through all responses that have a code
        for (const response of responses.filter(resp => resp.responsecode)) {
            // Add the CMS response
            options.push({
                valueCoding: {
                    system: 'http://del.cms.gov',
                    code: response.responsecode,
                    display: response.responsetext,
                },
            });
            // Check if there is a LOINC response.
            const loinc = getLoincCode('response', asmtid, questionid, response.responseid, response.responsevalueid);
            if (loinc) {
                options.push({
                    valueCoding: loinc,
                });
            }
        }

        if (options.length) {
            item.answerOption = options;
        }
    }

    if (item.answerOption) {
        // For text and integer fields, then we can set it to choice mode if there are choices.
        if (item.type === 'text' || item.type === 'integer') {
            item.type = 'choice';
        }

        // If it's a choice field and there are min/max options, change to open choice.
        const hasValueOptions = item.answerOption.some(option => {
            return ['Minimum value', 'Maximum value'].includes(option.valueCoding.display);
        });
        if (hasValueOptions) {
            item.type = 'open-choice';
        }

        // If it's a choice field and there are options of either Text or ICD,
        // change to open choice and remove those options.
        const hasTextOptions = item.answerOption.some(option => {
            return ['Text', 'ICD'].includes(option.valueCoding.code);
        });
        if (hasTextOptions) {
            item.type = 'open-choice';
            item.answerOption = item.answerOption.filter(option => {
                return !(['Text', 'ICD'].includes(option.valueCoding.code));
            });
        }
    }

    // If it's choice or open choice and there are no options, make it text.
    if (['choice', 'open-choice'].includes(item.type) && item.answerOption && !item.answerOption.length) {
        item.type = 'text';
        delete item.answerOption;
    }

    // If it's choice or open choice and there is a maxlength, apply it.
    if (maxlength && !['choice', 'open-choice'].includes(item.type)) {
        item.maxLength = maxlength;
    }

    return item;
}

function applyQuestions(resource, questions, responses) {
    if (!questions) {
        return;
    }

    questions = sortBy(questions, ['sectionname']);

    const questionMap = {};
    const sectionMap = {};

    for (const question of questions) {
        // Check to see if we already have this section.
        // Create a new one if not.
        if (!sectionMap[question.sectionid]) {
            const section = {
                linkId: `Section-${question.sectionid}`,
                text: question.sectionname.trim(),
                type: 'group',
                readOnly: true,
                item: [],
            };
            const sectionLoinc = getLoincCode('section', question.asmtid, question.sectionid);
            if (sectionLoinc) {
                section.code = [sectionLoinc];
            }
            sectionMap[question.sectionid] = section;
        }
        const section = sectionMap[question.sectionid];

        // This is a root question or subsection. Place directly in the section.
        if (!question.parentid) {
            const item = buildQuestion(question, responses[question.questionid]);
            questionMap[question.questionid] = item;
            section.item.push(item);
            continue;
        }

        // Otherwise we need to find the parent!
        const parent = questionMap[question.parentid];

        // If parent is not found, skip!
        if (!parent) {
            continue;
        }

        // Make sure parent has items array.
        if (!parent.item) {
            parent.item = [];
        }

        // Then add this question to parent.
        const newQuestion = buildQuestion(question, responses[question.questionid]);
        parent.item.push(newQuestion);
    }

    // Finally push each section to the questionnaire.
    resource.item = [];
    for (const section of Object.values(sectionMap)) {
        resource.item.push(section);
    }
}

/**
 * Build all questionnaires and return then as a list of objects.
 *
 * @param {String} profileUrl
 * @param {String} serverUrl
 * @param {import('pg').Client} client
 */
async function run(profileUrl, serverUrl, client) {
    const questionnaireResults = await getAllQuestionnaires(client);
    const groupedQuestions = await getGroupedQuestions(client, ['asmtid']);
    const responseMap = await getGroupedResponses(client, ['asmtid', 'questionid']);

    const output = [];

    for (const row of questionnaireResults) {
        const questionnaire = buildQuestionnaire(profileUrl, serverUrl, row);

        applyQuestions(questionnaire, groupedQuestions[questionnaire.id], responseMap[questionnaire.id]);

        output.push(questionnaire);
    }

    return output;
}

module.exports = { run };

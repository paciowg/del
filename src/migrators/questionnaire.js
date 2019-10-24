const {
    getAllQuestionnaires,
    getSectionsForQuestionnaire,
    getQuestionsForSection,
    getResponsesForQuestion,
} = require('../sql');

async function buildQuestionnaire(
    client,
    profileUrl,
    serverUrl,
    { approvalDate, assessmentId, assessmentName, date, description, endDate, loincCode, loincText, name, publisher, startDate, status, subsetName, version },
) {
    const resource = {
        resourceType: 'Questionnaire',
        id: assessmentId,
        url: `${serverUrl}/Questionnaire/${assessmentId}`,
        meta: {
            profile: `${profileUrl}/StructureDefinition/del-StandardForm`,
        },
        identifier: [{
            system: 'http://del.cms.gov',
            use: 'official',
            value: assessmentName,
        }],
        text: {
            status: 'generated',
            div: `<div xmlns="http://www.w3.org/1999/xhtml">${name} standard form version ${version}.<br/><br/>${description}</div>`,
        },
        status, // active, draft, retired
        date, // date last changed
        name,
        version,
        publisher,
        title: `${assessmentName} - ${subsetName}`,
        description,
        effectivePeriod: { start: startDate },
        item: [],
    };

    if (endDate && endDate > startDate) {
        resource.effectivePeriod.end = endDate;
    }

    if (approvalDate) {
        resource.approvalDate = approvalDate;
    }

    if (loincCode && loincText) {
        resource.code = [{
            system: 'http://loinc.org',
            display: loincText,
            code: loincCode,
        }];
    }

    // Find sections for the questionnaire.
    const sectionResults = await getSectionsForQuestionnaire(client, { assessmentId });

    for (const sectionData of sectionResults) {
        const section = await buildSection(client, sectionData);
        resource.item.push(section);
    }

    return resource;
}

async function buildSection(client, { assessmentId, sectionId, sectionName, sectionDesc, loincCode, loincText }) {
    const section = {
        linkId: `Section-${sectionId}`,
        text: sectionName.trim(),
        type: 'group',
        readOnly: true,
    };

    if (loincCode && loincText) {
        section.code = [{
            system: 'http://loinc.org',
            display: loincText,
            code: loincCode,
        }];
    }

    // Find all questions for this section.
    const questionResults = await getQuestionsForSection(client, { assessmentId, sectionId });
    const questions = await buildQuestions(client, questionResults);
    if (questions && questions.length) {
        section.item = questions;
    }

    return section;
}

async function buildQuestions(client, questionResults) {
    const questionMap = {};

    for (const question of questionResults) {
        // This is a root question or subsection. Place directly in the section.
        if (!question.parentId) {
            const rootQuestion = await buildQuestion(client, question);
            questionMap[question.questionId] = rootQuestion;
            continue;
        }

        // Otherwise we need to find the parent.
        // If parent is not found in this section, skip.
        const parent = questionMap[question.parentId];
        if (!parent) {
            continue;
        }
        // Make sure parent has items list.
        if (!parent.item) {
            parent.item = [];
        }

        // Then add this question to parent.
        const newQuestion = await buildQuestion(client, question);
        parent.item.push(newQuestion);
    }

    // Finally return a list of questions.
    const questionList = [];
    for (const question of Object.values(questionMap)) {
        questionList.push(question);
    }

    return questionList;
}

async function buildQuestion(client, { assessmentId, dataType, dataTypeName, maxLength, sectionId, questionId, parentId, label, name, text, loincCode, loincText }) {
    let type = 'group';
    if (dataType === 'character') type = 'text';
    if (dataType === 'number') type = 'integer';
    if (dataType === 'date') type = 'open-choice';

    const question = {
        linkId: `Section-${sectionId}/${label}`,
        prefix: label,
        text: text.trim(),
        type,
        repeats: dataTypeName == 'checklist',
        readOnly: type === 'group',
    };

    if (loincCode && loincText) {
        question.code = [{
            system: 'http://loinc.org',
            display: loincText,
            code: loincCode,
        }];
    }

    // Get any responses for the question.
    const responseData = await getResponsesForQuestion(client, { assessmentId, questionId });
    const responses = await buildResponses(responseData);
    if (responses && responses.length) {
        question.answerOption = responses;
    }

    if (question.answerOption) {
        // For text and integer fields, then we can set it to choice mode if there are choices.
        if (question.type === 'text' || question.type === 'integer') {
            question.type = 'choice';
        }

        // If it's a choice field and there are min/max options, change to open choice.
        const hasValueOptions = question.answerOption.some(option => {
            return ['Minimum value', 'Maximum value'].includes(option.valueCoding.display);
        });
        if (hasValueOptions) {
            question.type = 'open-choice';
        }

        // If it's a choice field and there are options of either Text or ICD,
        // change to open choice and remove those options.
        const hasTextOptions = question.answerOption.some(option => {
            return ['Text', 'ICD'].includes(option.valueCoding.code);
        });
        if (hasTextOptions) {
            question.type = 'open-choice';
            question.answerOption = question.answerOption.filter(option => {
                return !(['Text', 'ICD'].includes(option.valueCoding.code));
            });
        }
    }

    // If it's choice or open choice and there are no options, make it text.
    if (['choice', 'open-choice'].includes(question.type) && question.answerOption && !question.answerOption.length) {
        question.type = 'text';
        delete question.answerOption;
    }

    // If it's choice or open choice and there is a maxlength, apply it.
    if (maxLength && !['choice', 'open-choice'].includes(question.type)) {
        question.maxLength = maxLength;
    }

    return question;
}

async function buildResponses(responseData) {
    const options = [];

    for (const { responseCode, responseText, loincCode, loincText } of responseData) {
        options.push({
            valueCoding: {
                system: 'http://del.cms.gov',
                code: responseCode,
                display: responseText,
            },
        });
        if (loincCode && loincText) {
            options.push({
                valueCoding: {
                    system: 'http://loinc.org',
                    code: loincCode,
                    display: loincText,
                },
            });
        }
    }

    return options;
}

/**
 * Build all questionnaires and return then as a list of objects.
 *
 * @param {import('pg').Client} client
 * @param {String} profileUrl
 * @param {String} serverUrl
 */
async function run(client, profileUrl, serverUrl) {
    const questionnaireResults = await getAllQuestionnaires(client);

    const output = [];

    for (const rowData of questionnaireResults) {
        console.log(rowData.assessmentId);
        const questionnaire = await buildQuestionnaire(client, profileUrl, serverUrl, rowData);
        output.push(questionnaire);
    }

    return output;
}

module.exports = { run };

const { getAllLibraries, getLoincCode } = require('../sql');

function buildLibrary(profileUrl, serverUrl, {
    asmtid, version, status, date, name, description, title, publisher, startdate, enddate, approvaldate,
}) {
    const resource = {
        resourceType: 'Library',
        id: `Questionnaire-${asmtid}`,
        url: `${serverUrl}/Library/Questionnaire-${asmtid}`,
        meta: {
            profile: `${profileUrl}/StructureDefinition/del-StandardFormLibrary`,
        },
        text: {
            status: 'generated',
            div: `<div xmlns="http://www.w3.org/1999/xhtml">${name} standard form version ${version}.<br/><br/>${description}</div>`,
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
        effectivePeriod: { start: startdate },
    };

    const loinc = getLoincCode('questionnaire', asmtid);
    if (loinc) {
        resource.identifier = [
            {
                code: 'official',
                system: loinc.system,
                value: loinc.code,
            },
        ];
    }

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
 * @param {String} profileUrl
 * @param {String} serverUrl
 * @param {import('pg').Client} client
 */
async function run(profileUrl, serverUrl, client) {
    const libraryResults = await getAllLibraries(client);

    const output = [];

    for (const row of libraryResults) {
        const library = buildLibrary(profileUrl, serverUrl, row);

        output.push(library);
    }

    return output;
}

module.exports = { run };

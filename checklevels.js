var fs = require('fs');

const FILES = [
    './out/json/questionnaires/HIS-1.00.0.json',
    './out/json/questionnaires/HIS-2.00.0.json',
    './out/json/questionnaires/IRF-PAI-1.10.json',
    './out/json/questionnaires/IRF-PAI-1.2.json',
    './out/json/questionnaires/IRF-PAI-1.3.json',
    './out/json/questionnaires/IRF-PAI-1.4.json',
    './out/json/questionnaires/IRF-PAI-1.5.json',
    './out/json/questionnaires/IRF-PAI-2.0.json',
    './out/json/questionnaires/IRF-PAI-3.0.json',
    './out/json/questionnaires/LCDS-1.01.json',
    './out/json/questionnaires/LCDS-2.01.json',
    './out/json/questionnaires/LCDS-3.00.json',
    './out/json/questionnaires/LCDS-4.00.json',
    './out/json/questionnaires/MDS3.0-1.00.2.json',
    './out/json/questionnaires/MDS3.0-1.00.6.json',
    './out/json/questionnaires/MDS3.0-1.10.json',
    './out/json/questionnaires/MDS3.0-1.11.json',
    './out/json/questionnaires/MDS3.0-1.12.json',
    './out/json/questionnaires/MDS3.0-1.13.json',
    './out/json/questionnaires/MDS3.0-1.14.json',
    './out/json/questionnaires/MDS3.0-1.15.json',
    './out/json/questionnaires/MDS3.0-1.16.json',
    './out/json/questionnaires/MDS3.0-1.17.json',
    './out/json/questionnaires/OASIS-C-082009.json',
    './out/json/questionnaires/OASIS-C1-012015.json',
    './out/json/questionnaires/OASIS-C1-102015.json',
    './out/json/questionnaires/OASIS-C2-012017.json',
    './out/json/questionnaires/OASIS-D-012019.json',
    './out/json/questionnaires/OASIS-D1-012020.json',
    './out/json/questionnaires/OASIS-E.json',
];

function countlevels(data) {
    let level = 0;

    // if (data.item) {
    //     level += 1;
    //     level += countlevels(data.item[0]);
    // }

    return level;
}

function main() {
    FILES.forEach(file => {
        const data = JSON.parse(fs.readFileSync(file));

        console.log(file, countlevels(data));
    });
}

main();

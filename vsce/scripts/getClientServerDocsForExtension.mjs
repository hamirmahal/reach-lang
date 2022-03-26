import { readFileSync as rFS, writeFileSync } from "fs";

const CONSENSUS = rFS('../docs/src/rsh/consensus/index.md');
const STEP = rFS('../docs/src/rsh/step/index.md');
const COMPUTE = rFS('../docs/src/rsh/compute/index.md');
const MODULE = rFS('../docs/src/rsh/module/index.md');
const APP_INIT = rFS('../docs/src/rsh/appinit/index.md');
const LOCAL = rFS('../docs/src/rsh/local/index.md');
const ERRORS = rFS('../docs/src/rsh/errors/index.md');

const IS_KEYWORD = str => {
    return str[0] === '`' && str[str.length - 1] === '`';
};

const IS_NOT_A_HEADER = string => string[0] !== '#';

/**
 *
 * @param {Buffer} section
 */
const GET_DOCUMENTATION_FOR = (
	section, clientSourceString, serverSourceString
) => {
	const arrayOfLines = section.toString().split('\n');
    for (let i = 0; i < arrayOfLines.length; i++) {
        const line = arrayOfLines[i];
        if (line.startsWith('### ')) {
            const array = line.split(' ');
            array.forEach(string => {
                if (IS_KEYWORD(string)) {
                    const keyword = string.slice(
                        1, string.length - 2
                    );
                    let copyOfI = i;
                    let documentationForThisKeyword = "'";
                    while (IS_NOT_A_HEADER(
                        arrayOfLines[copyOfI]
                    ) && copyOfI < arrayOfLines.length) {
                        // documentationForThisKeyword +=
                    }

                    clientSourceString += `'${keyword}': `;
                }
            });
        }
    }
};


let clientSrcStr = '';
let serverSrcStr = 'export default {\n    ';

clientSrcStr += 'export const CONSENSUS = {\n    ';
GET_DOCUMENTATION_FOR(CONSENSUS, clientSrcStr, serverSrcStr);

clientSrcStr += '\nexport const STEP = {\n    ';
GET_DOCUMENTATION_FOR(STEP, clientSrcStr, serverSrcStr);

clientSrcStr += '\nexport const COMPUTE = {\n    ';
GET_DOCUMENTATION_FOR(COMPUTE, clientSrcStr, serverSrcStr);

clientSrcStr += '\nexport const MODULE = {\n    ';
GET_DOCUMENTATION_FOR(MODULE, clientSrcStr, serverSrcStr);

clientSrcStr += '\nexport const APP_INIT = {\n    ';
GET_DOCUMENTATION_FOR(APP_INIT, clientSrcStr, serverSrcStr);

clientSrcStr += '\nexport const LOCAL = {\n    ';
GET_DOCUMENTATION_FOR(LOCAL, clientSrcStr, serverSrcStr);

clientSrcStr += '\nexport const ERRORS = {\n    ';
GET_DOCUMENTATION_FOR(ERRORS, clientSrcStr, serverSrcStr);

clientSrcStr += '\n';
serverSrcStr += '};\n';

writeFileSync('../client/src/docObjects.ts', clientSrcStr);
writeFileSync('../server/src/keywordToDoc.ts', serverSrcStr);
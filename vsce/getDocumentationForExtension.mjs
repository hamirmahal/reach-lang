import { readFileSync } from 'fs';

const CONSENSUS_PATH = '../docs/src/rsh/consensus/index.md';
const STEP_PATH = '../docs/src/rsh/step/index.md';
const COMPUTE_PATH = '../docs/src/rsh/compute/index.md';
const MODULE_PATH = '../docs/src/rsh/module/index.md';
const APP_INIT_PATH = '../docs/src/rsh/appinit/index.md';
const LOCAL_PATH = '../docs/src/rsh/local/index.md';

const CONSENSUS_AS_MARKDOWN = readFileSync(CONSENSUS_PATH);
const STEP_AS_MARKDOWN = readFileSync(STEP_PATH);
const COMPUTE_AS_MARKDOWN = readFileSync(COMPUTE_PATH);
const MODULE_AS_MARKDOWN = readFileSync(MODULE_PATH);
const APP_INIT_AS_MARKDOWN = readFileSync(APP_INIT_PATH);
const LOCAL_AS_MARKDOWN = readFileSync(LOCAL_PATH);

// convert markdown to ... ?
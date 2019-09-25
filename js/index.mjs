import Web3            from 'web3';
import * as crypto     from 'crypto';
import * as nodeAssert from 'assert';
import ethers          from 'ethers';
import Timeout         from 'await-timeout';

const uri = process.env.ETH_NODE_URI || 'http://localhost:8545';
// XXX expose setProvider
const web3 = new Web3(new Web3.providers.HttpProvider(uri));
const ethersp = new ethers.providers.Web3Provider(web3.currentProvider);
ethersp.pollingInterval = 500; // ms
const ethersBlockOnceP = () =>
      new Promise((resolve) => ethersp.once('block', (n) => resolve(n)));

const panic = e => { throw Error(e); };

const un0x           = h => h.replace(/^0x/, '');
const hexTo0x        = h => '0x' + h.replace(/^0x/, '');
const byteToHex      = b => (b & 0xFF).toString(16).padStart(2, '0');
const byteArrayToHex = b => Array.from(b, byteToHex).join('');

const DEBUG = true;
const debug = msg => { if (DEBUG) {
  console.log(`DEBUG: ${msg}`); } };

const nat_to_fixed_size_hex = size => n => {
  const err = m => panic(`nat_to_fixed_size_hex: ${m}`);

  const notNat = !(Number.isInteger(n) && 0 <= n);
  const tooBig = !(Math.ceil(Math.log2(n + 1) / 8) <= size);

  return notNat ? err(`expected a nat`)
    : tooBig ? err(`expected a nat that fits into ${size} bytes`)
    : n.toString(16).padStart((2 * size), '0');
};

// Encodes a 16-bit unsigned integer as 2 hex bytes or 4 hex characters
const nat16_to_fixed_size_hex =
      nat_to_fixed_size_hex(2);

export const balanceOf = async a =>
  toBN(await web3.eth.getBalance(a.address));

export const assert = d => nodeAssert.strict(d);

export const toWei     = web3.utils.toWei;
export const toBN      = web3.utils.toBN;
export const toWeiBN = (a,b) => toBN(toWei(a, b));
export const isBN      = web3.utils.isBN;
export const keccak256 = web3.utils.keccak256;

export const hexToBN          = h => toBN(hexTo0x(h));
export const uint256_to_bytes = i => bnToHex(i);

export const bnToHex = (u, size = 32) =>
  toBN(u)
  .toTwos(8 * size)
  .toString(16, 2 * size);

const hexOf = x =>
      typeof x === 'string' && x.slice(0, 2) === '0x'
      ? un0x(web3.utils.toHex(x))
      : un0x(web3.utils.toHex(`0x${x}`));

export const bytes_eq = (x, y) =>
  hexOf(x) === hexOf(y);

export const bytes_len = b => {
  const bh = hexOf(b);
  const n  = bh.length / 2;

  return !Number.isInteger(n)
    ? panic(`Invalid byte string: ${bh}`)
    : n;
};

// ∀ a b, msg_left (msg_cat(a, b)) = a
// ∀ a b, msg_right(msg_cat(a, b)) = b
export const bytes_cat = (a, b) => {
  const ah = hexOf(a);
  const bh = hexOf(b);
  const n  = nat16_to_fixed_size_hex(bytes_len(ah));

  return '0x' +  n + ah + bh;
};

export const random_uint256 = () =>
  hexToBN(byteArrayToHex(crypto.randomBytes(32)));

export const eq = (a, b) => toBN(a).eq( toBN(b));
export const equal = eq;
export const add   = (a, b) => toBN(a).add(toBN(b));
export const sub   = (a, b) => toBN(a).sub(toBN(b));
export const mod   = (a, b) => toBN(a).mod(toBN(b));
export const mul   = (a, b) => toBN(a).mul(toBN(b));
export const ge    = (a, b) => toBN(a).gte(toBN(b));
export const gt    = (a, b) => toBN(a).gt( toBN(b));
export const le    = (a, b) => toBN(a).lte(toBN(b));
export const lt    = (a, b) => toBN(a).lt( toBN(b));

const checkType = (t, x) => {
  if ( t === 'bool' ) { return typeof(x) === 'boolean'; }
  else if ( t === 'uint256' ) { return web3.utils.isBN(t); }
  else if ( t === 'bytes' ) { return web3.utils.isHex(t) || typeof(x) === 'string'; } };
export const isType = (t, x) => {
  if ( checkType(t, x) ) { return x; }
  else { panic(`Expected ${t}, got: "${x}"`); } };

// `t` is a type name in string form; `v` is the value to cast
export const encode = (t, v) =>
  ethers.utils.defaultAbiCoder.encode([t], [v]);

// https://web3js.readthedocs.io/en/v1.2.0/web3-eth.html#sendtransaction
export const transfer = (to, from, value) =>
  web3.eth.sendTransaction({ to, from, value });

// Helpers for sendrecv and recv

const rejectInvalidReceiptFor =
      txHash =>
      r =>
      new Promise((resolve, reject) =>
                  !r                           ? reject(`No receipt for txHash: ${txHash}`)
                  : r.transactionHash !== txHash ? reject(`Bad txHash; ${txHash} !== ${r.transactionHash}`)
                  : !r.status                    ? reject(`Transaction: ${txHash} was reverted by EVM\n${r}`)
                  : resolve(r));

const fetchAndRejectInvalidReceiptFor = txHash =>
      web3.eth.getTransactionReceipt(txHash)
      .then(rejectInvalidReceiptFor(txHash));

export const connectAccount = address => {
  const shad = address.substring(2,6);

  const attach = (abi, ctors, ctc_address, creation_block) => {
    const ethCtc = new web3.eth.Contract(abi, ctc_address);
    const ethersCtc = new ethers.Contract(ctc_address, abi, ethersp);
    const eventOnceP = (e) =>
          new Promise((resolve) => ethersCtc.once(e, (...a) => resolve(a)));

    debug(`${shad}: created at ${creation_block}`);
    let last_block = creation_block;

    // https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#web3-eth-contract
    /* eslint require-atomic-updates: off */
    const sendrecv = async (label, funcName, args, value, eventName, timeout_delay, timeout_evt ) => {
      void(eventName);
      // XXX
      void(timeout_delay, timeout_evt);
      // https://github.com/ethereum/web3.js/issues/2077
      const munged = [ last_block, ...ctors, ...args ]
            .map(m => isBN(m) ? m.toString() : m);

      debug(`${shad}: send ${label} ${funcName}: start (${last_block})`);
      // XXX Will this retry until it works?
      const r_maybe =
            await (ethCtc.methods[funcName](...munged)
                   .send({ from: address, value })
                   .on('error', (err, r) =>
                       // XXX I think this is how a failed assertion shows up
                       panic(`Error from contract: ${label} ${funcName}: ${err} ${r}`)));
      debug(`${shad}: send ${label} ${funcName}: check receipt`);
      const r_ok = await fetchAndRejectInvalidReceiptFor(r_maybe.transactionHash);
      const this_block = r_ok.blockNumber;
      debug(`${shad}: send ${funcName} at ${this_block}`);
      last_block = this_block;
      debug(`${shad}: send ${label} ${funcName}: getBalance`);
      const nbs = await web3.eth.getBalance(ctc_address, this_block);

      debug(`${shad}: send ${label} ${funcName}: stop`);
      return { didTimeout: false, value: value, balance: toBN(nbs) };
    };

    // https://docs.ethers.io/ethers.js/html/api-contract.html#configuring-events
    const recv = async (label, ok_evt, timeout_delay, timeout_me, timeout_args, timeout_fun, timeout_evt ) => {
      // XXX
      void(timeout_me, timeout_args, timeout_fun, timeout_evt);

      const ok_args_abi = abi
            .find(a => a.name === ok_evt)
            .inputs;

      let block_poll_start = last_block;
      let block_poll_end = block_poll_start;
      const deadline_block = last_block + timeout_delay;
      while ( block_poll_start < deadline_block ) {
        debug(`${shad}: ?? ${ok_evt} in [${block_poll_start},${block_poll_end}], deadline is ${deadline_block}`);
        void(eventOnceP); // XXX This might be nice, but it may miss things too.
        const es = await ethCtc.getPastEvents(ok_evt, { fromBlock: block_poll_start, toBlock: block_poll_end });
        if ( es.length == 0 ) {
          debug(`${shad}: NO ${ok_evt} in [${block_poll_start},${block_poll_end}], deadline is ${deadline_block}`);
          block_poll_start = block_poll_end;

          await Timeout.set(10); // XXX This should be more reasonable in a live version
          void(ethersBlockOnceP); // This might be a better option?
          block_poll_end = await ethersp.getBlockNumber();

          debug(`${shad}: UP ${ok_evt} to [${block_poll_start},${block_poll_end}], deadline is ${deadline_block}`);
          continue;
        } else {
          debug(`${shad}: YS ${ok_evt} in [${block_poll_start},${block_poll_end}], deadline is ${deadline_block}`);
          const ok_e = es[0];

          const decoded = web3.eth.abi.decodeLog(ok_args_abi, ok_e.raw.data, ok_e.raw.topics);
          const ok_vals = ok_args_abi.map(a => a.name).map(n => decoded[n]);

          const ok_r = await fetchAndRejectInvalidReceiptFor(ok_e.transactionHash);
          void(ok_r);
          const ok_t = await web3.eth.getTransaction(ok_e.transactionHash);

          const this_block = ok_t.blockNumber;
          last_block = this_block;
          const nbs = await web3.eth.getBalance(ctc_address, this_block);
          return { didTimeout: false, data: ok_vals, value: ok_t.value, balance: toBN(nbs) }; } }

      panic(`Timeout! XXX`);
      process.exit(1);
    };

    return { sendrecv, recv, creation_block, address: ctc_address };
  };

  // https://web3js.readthedocs.io/en/v1.2.0/web3-eth.html#sendtransaction
  const deploy = async (abi, bytecode, ctors) => {
    // XXX track down solid docs RE: why the ABI would have extra
    // constructor fields and when/how/why dropping leading `0x`s is
    // necessary
    const ctorTypes = abi
          .find(a => a.type === 'constructor')
          .inputs
          .map(i => i.type)
          .slice(0, ctors.length);

    const encodedCtors = ctors
          .map(c => encode(ctorTypes[ctors.indexOf(c)], c))
          .map(un0x);

    const data = [ bytecode, ...encodedCtors ].join('');

    const gas = await web3.eth.estimateGas({ data });
    const r = await web3.eth.sendTransaction({ data, gas, from: address });
    const r_ok = await rejectInvalidReceiptFor(r.transactionHash)(r);
    return attach(abi, ctors, r_ok.contractAddress, r_ok.blockNumber);
  };

  return { deploy, attach, address }; };

export const newTestAccount = async (startingBalance) => {
  const [ prefunder ] = await web3.eth.personal.getAccounts();

  const to = await web3.eth.personal.newAccount('');

  if ( await web3.eth.personal.unlockAccount(to, '', 999999999) ) {
    await transfer(to, prefunder, startingBalance);
    return connectAccount(to); }
  else {
    throw Error(`Couldn't unlock account ${to}!`); } };

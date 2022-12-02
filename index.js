console.clear();
import { Client, AccountId, PrivateKey, Hbar, PrngTransaction, ContractFunctionParameters } from "@hashgraph/sdk";

import dotenv from "dotenv";
dotenv.config();

import * as queries from "./utils/queries.js";
import * as contracts from "./utils/contractOperations.js";
import contract from "./contracts/PrngSystemContract.json" assert { type: "json" };

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));
client.setMaxQueryPayment(new Hbar(50));

async function main() {
	// STEP 1 ===================================
	console.log(`\nSTEP 1 ===================================\n`);
	console.log(`- Generating random numbers with the SDK...\n`);

	const lo = 0;
	const hi = 50;

	let randomNum = [];
	for (var i = 0; i < 5; i++) {
		const randomNumTx = await new PrngTransaction().setRange(hi).execute(client);
		const randomNumRec = await randomNumTx.getRecord(client);
		randomNum[i] = randomNumRec.prngNumber;
		console.log(`- Run #${i + 1}: Random number = ${randomNum[i]}`);
	}

	// STEP 2 ===================================
	console.log(`\nSTEP 2 ===================================\n`);
	console.log(`- Generating random number with Solidity...\n`);

	// Deploy the Solidity contract
	let gasLim = 4000000;
	const bytecode = contract.object;
	const [contractId, contractAddress] = await contracts.deployContractFcn(bytecode, gasLim, client);
	console.log(`- Contract ID: ${contractId}`);
	console.log(`- Contract ID in Solidity address format: ${contractAddress}`);

	// Execute the contract
	const randNumParams = new ContractFunctionParameters().addUint32(lo).addUint32(hi);
	const randNumRec = await contracts.executeContractFcn(contractId, "getPseudorandomNumber", randNumParams, gasLim, client);
	console.log(`- Contract execution: ${randNumRec.receipt.status} \n`);

	// Query the transaction record to get the random number from bytes
	const recQuery = await queries.txRecQueryFcn(randNumRec.transactionId, client);

	let lowOrderBytes = new Uint8Array(recQuery.children[0].prngBytes).slice(28, 32);
	let dataview = new DataView(lowOrderBytes.buffer);
	let range = hi - lo;
	let int32be = dataview.getUint32(0);
	let randNum = int32be % range;
	console.log(`- The random number (using transaction record) = ${randNum}`);

	// Call the contract to read random number using the getNumber function
	const randNumResult = await contracts.callContractFcn(contractId, "getNumber", gasLim, client);
	console.log(`- The random number (using contract function) = ${randNumResult.getUint32(0)}`);
	randNum === randNumResult.getUint32(0) ? console.log(`- The random number checks out ✅`) : console.log(`- Random number doesn't match ❌`);

	// Check a Mirror Node Explorer
	const [randNumInfo, randNumExpUrl] = await queries.mirrorTxQueryFcn(randNumRec.transactionId);
	console.log(`\n- See details in mirror node explorer: \n${randNumExpUrl}`);

	console.log(`
====================================================
🎉🎉 THE END - NOW JOIN: https://hedera.com/discord
====================================================\n`);
}
main();

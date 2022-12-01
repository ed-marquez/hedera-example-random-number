console.clear();
import { Client, AccountId, PrivateKey, Hbar, PrngTransaction, ContractFunctionParameters } from "@hashgraph/sdk";

import dotenv from "dotenv";
dotenv.config();
import fs from "fs";

import accountCreateFcn from "./utils/accountCreate.js";
import * as queries from "./utils/queries.js";
import * as htsTokens from "./utils/tokenOperations.js";
import * as contracts from "./utils/contractOperations.js";
import contract from "./PrngSystemContract.json" assert { type: "json" };

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));
client.setMaxQueryPayment(new Hbar(50));

async function main() {
	// STEP 1 ===================================
	console.log(`\nSTEP 1 ===================================\n`);
	console.log(`- Generating random number with the SDK...\n`);

	// const randomNumTx = await new PrngTransaction().setRange(10).execute(client);
	// const randomNumRec = await randomNumTx.getRecord(client);
	// const randomNum = randomNumRec.prngNumber;
	// console.log(`- Random number: ${randomNum}`);

	// let randomNum = [];
	// for (var i = 0; i < 10; i++) {
	// 	const randomNumTx = await new PrngTransaction().setRange(7).execute(client);
	// 	const randomNumRec = await randomNumTx.getRecord(client);
	// 	randomNum[i] = randomNumRec.prngNumber;
	// 	console.log(`- Random number ${i + 1}: ${randomNum[i]}`);
	// }

	// STEP 2 ===================================
	console.log(`\nSTEP 2 ===================================\n`);
	console.log(`- Generating random number with Solidity...\n`);

	let gasLim = 4000000;
	const bytecode = contract.object;
	const [contractId, contractAddress] = await contracts.deployContractFcn(bytecode, gasLim, client);
	console.log(`\n- Contract ID: ${contractId}`);
	console.log(`- Contract ID in Solidity address format: ${contractAddress}`);

	// console.log(`- Treasury approving fungible token allowance for Alice...\n`);

	const rnParams = new ContractFunctionParameters().addUint32(1).addUint32(10);
	const mintFtRec = await contracts.executeContractFcn(contractId, "getPseudorandomNumber", rnParams, gasLim, client);
	console.log(`- Contract call for random number: ${mintFtRec.receipt.status} \n`);

	const recQuery = await queries.txRecQueryFcn(mintFtRec.transactionId, client);

	const numberResult = await contracts.callContractFcn(contractId, "getNumber", gasLim, client);
	console.log(`- Random number: ${numberResult.getUint32(0)} \n`);
	console.log(`- Random number2: ${recQuery.children[0].prngBytes.readUint32BE(28)} \n`);

	const [mintFtInfo, mintExpUrl] = await queries.mirrorTxQueryFcn(mintFtRec.transactionId);
	console.log(`- See details: ${mintExpUrl}`);

	console.log(`
====================================================
🎉🎉 THE END - NOW JOIN: https://hedera.com/discord
====================================================\n`);
}
main();

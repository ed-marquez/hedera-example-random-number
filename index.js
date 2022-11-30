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
	console.log(`- Creating Hedera accounts, HTS token, and contract...\n`);

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

	// // Accounts
	// const initBalance = new Hbar(15);
	// const treasuryKey = PrivateKey.generateED25519();
	// const [treasurySt, treasuryId] = await accountCreateFcn(treasuryKey, initBalance, client);
	// console.log(`- Treasury's account: https://hashscan.io/#/testnet/account/${treasuryId}`);
	// const aliceKey = PrivateKey.generateED25519();
	// const [aliceSt, aliceId] = await accountCreateFcn(aliceKey, initBalance, client);
	// console.log(`- Alice's account: https://hashscan.io/#/testnet/account/${aliceId}`);
	// const bobKey = PrivateKey.generateED25519();
	// const [bobSt, bobId] = await accountCreateFcn(bobKey, initBalance, client);
	// console.log(`- Bob's account: https://hashscan.io/#/testnet/account/${bobId}`);

	// //Token
	// const [tokenId, tokenInfo] = await htsTokens.createFtFcn("HBAR ROCKS", "HROCK", 100, treasuryId, treasuryKey, client);
	// const tokenAddressSol = tokenId.toSolidityAddress();
	// console.log(`\n- Token ID: ${tokenId}`);
	// console.log(`- Token ID in Solidity format: ${tokenAddressSol}`);
	// console.log(`- Initial token supply: ${tokenInfo.totalSupply.low}`);

	// Contract
	// Import the compiled contract bytecode
	// const bytecode = fs.readFileSync("./binaries/ApproveAllowances.bin");
	let gasLim = 4000000;
	const bytecode = contract.object;
	const [contractId, contractAddress] = await contracts.deployContractFcn(bytecode, gasLim, client);
	console.log(`\n- Contract ID: ${contractId}`);
	console.log(`- Contract ID in Solidity address format: ${contractAddress}`);

	// // STEP 2 ===================================
	// console.log(`\nSTEP 2 ===================================\n`);
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

	// // STEP 3 ===================================
	// console.log(`\nSTEP 3 ===================================\n`);
	// console.log(`- Alice performing allowance transfer from Treasury to Bob...\n`);

	// // STEP 4 ===================================
	// console.log(`\nSTEP 4 ===================================\n`);
	// console.log(`- Treasury deleting fungible token allowance for Alice...\n`);

	console.log(`
====================================================
🎉🎉 THE END - NOW JOIN: https://hedera.com/discord
====================================================\n`);
}
main();

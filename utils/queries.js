import { TransactionRecordQuery, TokenInfoQuery, AccountBalanceQuery } from "@hashgraph/sdk";
import axios from "axios";

export async function txRecQueryFcn(txId, client) {
	const recQuery = await new TransactionRecordQuery().setTransactionId(txId).setIncludeChildren(true).execute(client);
	return recQuery;
}

export async function tokenQueryFcn(tkId, client) {
	let info = await new TokenInfoQuery().setTokenId(tkId).execute(client);
	return info;
}

export async function balanceCheckerFcn(acId, tkId, client) {
	let balanceCheckTx = [];
	try {
		balanceCheckTx = await new AccountBalanceQuery().setAccountId(acId).execute(client);
		console.log(
			`- Balance of account ${acId}: ${balanceCheckTx.hbars.toString()} + ${balanceCheckTx.tokens._map.get(tkId.toString())} unit(s) of token ${tkId}`
		);
	} catch {
		balanceCheckTx = await new AccountBalanceQuery().setContractId(acId).execute(client);
		console.log(
			`- Balance of contract ${acId}: ${balanceCheckTx.hbars.toString()} + ${balanceCheckTx.tokens._map.get(
				tkId.toString()
			)} unit(s) of token ${tkId}`
		);
	}
}

export async function mirrorTxQueryFcn(txIdRaw) {
	// Query a mirror node for information about the transaction
	const delay = (ms) => new Promise((res) => setTimeout(res, ms));
	await delay(10000); // Wait for 10 seconds before querying a mirror node

	const txIdPretty = prettify(txIdRaw.toString());
	const mirrorNodeExplorerUrl = `https://hashscan.io/testnet/transaction/${txIdPretty}`;
	const mirrorNodeRestApi = `https://testnet.mirrornode.hedera.com/api/v1/transactions/${txIdPretty}`;
	const mQuery = await axios.get(mirrorNodeRestApi);

	return [mQuery, mirrorNodeExplorerUrl];
}

function prettify(txIdRaw) {
	const a = txIdRaw.split("@");
	const b = a[1].split(".");
	return `${a[0]}-${b[0]}-${b[1]}`;
}

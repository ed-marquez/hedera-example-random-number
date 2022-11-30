import { TokenCreateTransaction, TokenType, TokenSupplyType, TokenMintTransaction } from "@hashgraph/sdk";
import * as queries from "./queries.js";

export async function createFtFcn(tName, tSymbol, iSupply, id, pvKey, client) {
	const tokenCreateTx = new TokenCreateTransaction()
		.setTokenName(tName)
		.setTokenSymbol(tSymbol)
		.setDecimals(0)
		.setInitialSupply(iSupply)
		.setTreasuryAccountId(id)
		.setAdminKey(pvKey.publicKey)
		.setSupplyKey(pvKey.publicKey)
		.freezeWith(client);
	const tokenCreateSign = await tokenCreateTx.sign(pvKey);
	const tokenCreateSubmit = await tokenCreateSign.execute(client);
	const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
	const tokenId = tokenCreateRx.tokenId;

	const tokenInfo = await queries.tokenQueryFcn(tokenId, client);

	return [tokenId, tokenInfo];
}

export async function createMintNftFcn(tName, tSymbol, iSupply, maxSupply, id, pvKey, client) {
	const nftCreate = new TokenCreateTransaction()
		.setTokenName(tName)
		.setTokenSymbol(tSymbol)
		.setTokenType(TokenType.NonFungibleUnique)
		.setSupplyType(TokenSupplyType.Finite)
		.setDecimals(0)
		.setInitialSupply(iSupply)
		.setTreasuryAccountId(id)
		.setSupplyKey(pvKey.publicKey)
		.setMaxSupply(maxSupply)
		// .setCustomFees([nftCustomFee])
		// .setAdminKey(adminKey)
		// .setPauseKey(pauseKey)
		// .setFreezeKey(freezeKey)
		// .setWipeKey(wipeKey)
		.freezeWith(client);

	const nftCreateTxSign = await nftCreate.sign(pvKey);
	const nftCreateSubmit = await nftCreateTxSign.execute(client);
	const nftCreateRx = await nftCreateSubmit.getReceipt(client);
	const tokenId = nftCreateRx.tokenId;

	// // MINT NEW BATCH OF NFTs
	const CID = [
		Buffer.from("ipfs://QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn"),
		Buffer.from("ipfs://QmZ4dgAgt8owvnULxnKxNe8YqpavtVCXmc1Lt2XajFpJs9"),
		Buffer.from("ipfs://QmPzY5GxevjyfMUF5vEAjtyRoigzWp47MiKAtLBduLMC1T"),
		Buffer.from("ipfs://Qmd3kGgSrAwwSrhesYcY7K54f3qD7MDo38r7Po2dChtQx5"),
		Buffer.from("ipfs://QmWgkKz3ozgqtnvbCLeh7EaR1H8u5Sshx3ZJzxkcrT3jbw"),
	];
	const mintTx = new TokenMintTransaction()
		.setTokenId(tokenId)
		.setMetadata(CID) //Batch minting - UP TO 10 NFTs in single tx
		.freezeWith(client);
	const mintTxSign = await mintTx.sign(pvKey);
	const mintTxSubmit = await mintTxSign.execute(client);
	const mintRx = await mintTxSubmit.getReceipt(client);
	const tokenInfo = await queries.tokenQueryFcn(tokenId, client);

	return [tokenId, tokenInfo];
}

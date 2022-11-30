import { ContractCreateFlow, ContractExecuteTransaction, ContractCallQuery } from "@hashgraph/sdk";

export async function deployContractFcn(bytecode, gasLim, client) {
	const contractCreateTx = new ContractCreateFlow().setBytecode(bytecode).setGas(gasLim);
	const contractCreateSubmit = await contractCreateTx.execute(client);
	const contractCreateRx = await contractCreateSubmit.getReceipt(client);
	const contractId = contractCreateRx.contractId;
	const contractAddress = contractId.toSolidityAddress();
	return [contractId, contractAddress];
}

export async function executeContractFcn(cId, fcnName, params, gasLim, client) {
	const contractExecuteTx = new ContractExecuteTransaction().setContractId(cId).setGas(gasLim).setFunction(fcnName, params);
	const contractExecuteSubmit = await contractExecuteTx.execute(client);
	const contractExecuteRec = await contractExecuteSubmit.getRecord(client);
	return contractExecuteRec;
}

export async function callContractFcn(cId, fcnName, gasLim, client) {
	const contractCallTx = new ContractCallQuery().setContractId(cId).setGas(gasLim).setFunction(fcnName);
	const contractCallSubmit = await contractCallTx.execute(client);
	return contractCallSubmit;
}

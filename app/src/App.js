import { ethers } from "ethers";
import { useEffect, useState } from "react";
import MultiSig from "./artifacts/contracts/MultiSig.sol/MultiSig.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);

const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

export async function sendGoods(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).sendGoods();
  await approveTxn.wait();
}

export async function confirmReceipt(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).confirmReceipt();
  await approveTxn.wait();
}

const ProposalType = {
  0: "Transaction",
  1: "Required",
  2: "AddOwner",
  3: "RemoveOwner",
  4: "SetDeposit",
  5: "Withdraw",
};

const proposalTypeOptions = [
  {
    name: "Transaction",
    value: 0,
  },
  {
    name: "Required",
    value: 1,
  },
  {
    name: "AddOwner",
    value: 2,
  },
  {
    name: "RemoveOwner",
    value: 3,
  },
  {
    name: "SetDeposit",
    value: 4,
  },
  {
    name: "Withdraw",
    value: 5,
  },
];

function App() {
  const [escrows, setEscrows] = useState([]);
  console.log("escrows: ", escrows);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [balance, setBalance] = useState();
  const [ownersCount, setOwnersCount] = useState();
  const [required, setRequired] = useState();
  const [depositMin, setDepositMin] = useState();
  const [owners, setOwners] = useState();
  const [amount, setAmount] = useState();
  const [proposals, setProposals] = useState();
  const [confirmProposalId, setConfirmProposalId] = useState();
  const [executeProposalId, setExecuteProposalId] = useState();
  const [proposalDestination, setProposalDestination] = useState();
  const [proposalName, setProposalName] = useState();
  const [proposalValue, setProposalValue] = useState();
  const [proposalType, setProposalType] = useState();
  const [loadingBalance, setLoadingBalance] = useState();
  const [loadingOwners, setLoadingOwners] = useState();
  const [loadingProposals, setLoadingProposals] = useState();
  const [loadingRequired, setLoadingRequired] = useState();
  const [loadingDeposit, setLoadingDeposit] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  const contract = new ethers.Contract(
    "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    MultiSig.abi,
    provider
  );
  const contractWithSigner = contract.connect(signer);

  async function getBalance() {
    setLoadingBalance(true);
    // get balance
    const contractBalance = await provider.getBalance(CONTRACT_ADDRESS);
    console.log("contractBalance._hex: ", contractBalance._hex);
    setBalance(parseInt(contractBalance._hex));
    setLoadingBalance(false);
  }

  async function getOwners() {
    // get owners
    setLoadingOwners(true);
    const _ownersCount = parseInt(
      (await contractWithSigner.ownersCount())._hex
    );
    console.log("_ownersCount: ", _ownersCount);
    setOwnersCount(_ownersCount);
    const _owners = [];
    for (let i = 0; i < _ownersCount; i++) {
      const owner = await contractWithSigner.owners(i);
      console.log("owner: ", owner);
      const balance = await contractWithSigner.deposits(owner);
      console.log("balance: ", balance);
      _owners.push({ address: owner, balance: parseInt(balance._hex) });
    }
    setOwners(_owners);
    console.log("_owners: ", _owners);
    setLoadingOwners(false);
    return { _owners, _ownersCount };
  }

  async function getProposals(_owners, _ownersCount) {
    // get proposals
    setLoadingProposals(true);
    const proposalCountHex = await contractWithSigner.proposalCount();
    const proposalCount = parseInt(proposalCountHex._hex);
    console.log("proposalCount: ", proposalCount);

    const _proposals = [];
    for (let i = 0; i < proposalCount; i++) {
      const _confirmations = [];
      const proposal = await contractWithSigner.proposals(i);
      for (let j = 0; j < _ownersCount; j++) {
        console.log("_owners[j]: ", _owners[j]);
        const confirmation = await contractWithSigner.confirmations(
          i,
          _owners[j].address
        );
        _confirmations.push(confirmation);
      }
      console.log("confirmations: ", _confirmations);
      _proposals.push({ ...proposal, id: i, confirmations: _confirmations });
    }
    console.log("_proposals: ", _proposals);
    setProposals(_proposals);
    setLoadingProposals(false);
  }

  async function getDeposit() {
    // get deposit
    setLoadingDeposit(true);

    const _deposit = parseInt((await contractWithSigner.deposit())._hex);
    console.log("_deposit: ", _deposit);
    setDepositMin(_deposit);
    setLoadingDeposit(false);
  }

  async function getRequired() {
    // get required
    setLoadingRequired(true);

    const _required = parseInt((await contractWithSigner.required())._hex);
    console.log("_required: ", _required);
    setRequired(_required);
    setLoadingRequired(false);
  }

  useEffect(() => {
    async function getAccounts() {
      // setup the contract

      const { _owners, _ownersCount } = await getOwners();

      await getBalance();

      await getProposals(_owners, _ownersCount);

      await getRequired();

      await getDeposit();

      contractWithSigner.on("Received", handleDepositMade);
      contractWithSigner.on("ProposalCreated", handleProposalsChanged);
      contractWithSigner.on("ProposalConfirmed", handleProposalsChanged);
      contractWithSigner.on("ProposalExecuted", handleAllChanged);
      contractWithSigner.on("WithdrawAll", handleWithdrawAll);
      contractWithSigner.on("DepositChanged", handleDepositChanged);
      contractWithSigner.on("OwnersChanged", handleOwnersChanged);
      contractWithSigner.on("RequiredChanged", handleRequiredChanged);
    }
    if (signer) {
      getAccounts();
    }
  }, [signer]);

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const handleDepositMade = async (account, amount) => {
    console.log(`Deposit made by ${account}: ${amount} wei`);
    // Fetch the updated balance after the deposit
    await getBalance();
    await getOwners();
  };

  const handleWithdrawAll = async () => {
    console.log(`Withraw all made`);
    // Fetch the updated balance after the deposit
    await getBalance();
  };

  const handleDepositChanged = async () => {
    console.log(`Deposit changed`);
    // Fetch the updated balance after the deposit
    await getDeposit();
  };

  const handleOwnersChanged = async () => {
    console.log(`Owners changed`);
    // Fetch the updated balance after the deposit
    await getOwners();
  };

  const handleRequiredChanged = async () => {
    console.log(`Required changed`);
    // Fetch the updated balance after the deposit
    await getRequired();
  };

  const handleAllChanged = async (proposalId) => {
    console.log(`On all Changed ID: ${proposalId}`);
    // Fetch the updated balance after the deposit
    const { _owners, _ownersCount } = await getOwners();

    await getBalance();

    await getProposals(_owners, _ownersCount);

    await getRequired();

    await getDeposit();
  };

  const handleProposalsChanged = async (proposalId) => {
    console.log(`Proposal created ID: ${proposalId}`);
    // Fetch the updated balance after the deposit
    const { _owners, _ownersCount } = await getOwners();

    await getProposals(_owners, _ownersCount);
  };

  async function deposit() {
    console.log("amount: ", amount);
    console.log("CONTRACT_ADDRESS: ", CONTRACT_ADDRESS);
    try {
      setLoadingBalance(true);
      setLoadingOwners(true);

      await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: amount,
      });
      setAmount("");
      console.log("Funds sent successfully");
    } catch (error) {
      console.error("Error sending funds:", error);
    }
  }

  async function executeProposal() {
    const proposal = await contractWithSigner.executeProposal(executeProposalId);
    setExecuteProposalId("");
    setLoadingProposals(true);
    setLoadingBalance(true);
    setLoadingDeposit(true);
    setLoadingOwners(true);
    setLoadingRequired(true);
    console.log("proposal: ", proposal);
  }

  async function confirmProposal() {
    const proposal = await contractWithSigner.confirmProposal(confirmProposalId);
    setConfirmProposalId("")
    setLoadingProposals(true);
    console.log("proposal: ", proposal);
  }

  async function addProposal() {
    console.log("proposalDestination: ", proposalDestination);
    console.log("proposalValue: ", proposalValue);
    console.log("proposalName: ", proposalName);
    console.log("proposalType: ", proposalType);
    const proposal = await contractWithSigner.submitProposal(
      proposalDestination,
      proposalValue,
      proposalName,
      proposalType
    );
    setProposalDestination("");
    setProposalValue("");
    setProposalName("");
    setProposalType("");
    setLoadingProposals(true);
    console.log("proposal: ", proposal);
  }

  return (
    <div className="appContainer">
      <div className="contract">
        <h2>Multi Sig Wallet Detail</h2>
        <div>Available balance: {loadingBalance ? "Loading" : balance}</div>
        <div>Owners count: {loadingOwners ? "Loading" : ownersCount}</div>

        <div>Required: {loadingRequired ? "Loading" : required}</div>
        <div>Deposit Min: {loadingDeposit ? "Loading" : depositMin}</div>
        <div>
          <h3>Owners - Deposits</h3>
          {loadingOwners
            ? "Loading"
            : owners?.map((owner) => (
                <div>
                  {owner.address} - {owner.balance}
                </div>
              ))}
        </div>
      </div>
      <div className="contract">
        <h2>Add funds</h2>
        <label>
          Deposit Amount (in WEI)
          <input
            type="text"
            id="wei"
            value={amount}
            onChange={setValue(setAmount)}
          />
        </label>

        <div
          className="button"
          onClick={(e) => {
            e.preventDefault();
            deposit();
          }}
        >
          Add funds
        </div>
      </div>
      <div className="contract">
        <h2>Proposals</h2>
        {loadingProposals
          ? "Loading"
          : proposals?.map((proposal) => (
              <div className="proposal">
                <div>ID: {proposal.id}</div>
                <div>Type: {ProposalType[proposal.typeName]}</div>
                <div>Address: {proposal.destination}</div>
                <div>Value: {parseInt(proposal?.value?._hex)}</div>
                <div>
                  Confirmations:{" "}
                  {proposal.confirmations.reduce((acc, currentValue) => {
                    return acc + (currentValue ? 1 : 0);
                  }, 0)}
                </div>
                <div>Executed: {proposal.executed ? "Yes" : "No"}</div>
              </div>
            ))}
      </div>

      <div className="contract">
        <h2>Add Proposal</h2>
        <label>
          Proposal Destination
          <input
            type="text"
            id="wei"
            value={proposalDestination}
            onChange={setValue(setProposalDestination)}
          />
        </label>
        <label>
          Proposal Value
          <input
            type="text"
            id="wei"
            value={proposalValue}
            onChange={setValue(setProposalValue)}
          />
        </label>
        <label>
          Proposal Name
          <input
            type="text"
            id="wei"
            value={proposalName}
            onChange={setValue(setProposalName)}
          />
        </label>
        <label>
          Proposal Type
          <select value={proposalType} onChange={setValue(setProposalType)}>
            {proposalTypeOptions.map((proposalType) => (
              <option value={proposalType.value}>{proposalType.name}</option>
            ))}
          </select>
        </label>

        <div
          className="button"
          onClick={(e) => {
            e.preventDefault();
            addProposal();
          }}
        >
          Add Proposal
        </div>
      </div>

      <div className="contract">
        <h2>Confirm proposal</h2>
        <label>
          Proposal ID
          <input
            type="text"
            id="wei"
            value={confirmProposalId}
            onChange={setValue(setConfirmProposalId)}
          />
        </label>

        <div
          className="button"
          onClick={(e) => {
            e.preventDefault();
            confirmProposal();
          }}
        >
          Confirm Proposal
        </div>
      </div>

      <div className="contract">
        <h2>Execute proposal</h2>
        <label>
          Proposal ID
          <input
            type="text"
            id="wei"
            value={executeProposalId}
            onChange={setValue(setExecuteProposalId)}
          />
        </label>

        <div
          className="button"
          onClick={(e) => {
            e.preventDefault();
            executeProposal();
          }}
        >
          Execute Proposal
        </div>
      </div>
    </div>
  );
}

export default App;

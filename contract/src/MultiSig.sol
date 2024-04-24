// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract MultiSig {
    address[] public owners;
    uint public required;
    uint public ownersCount = 0;
    uint public deposit;
    event Received(address sender, uint amount);
    event ProposalCreated(uint proposalId);
    event ProposalCount(uint count);
    event ContractBalance(uint count);
    event ProposalConfirmed(uint count);
    event ProposalExecuted(uint count);

    event WithdrawAll();
    event DepositChanged();
    event OwnersChanged();
    event RequiredChanged();

    enum ProposalType {
        Transaction,
        Required,
        AddOwner,
        RemoveOwner,
        SetDeposit,
        Withdraw
    }
    struct Proposal {
        address destination;
        uint value;
        bool executed;
        string name;
        ProposalType typeName;
    }
    mapping(uint => Proposal) public proposals;
    uint public proposalCount = 0;
    mapping(uint => mapping(address => bool)) public confirmations;
    mapping(address => uint) public deposits;

    // Set initial owner
    constructor(address _owner) {
        require(_owner != address(0));
        owners.push(_owner);
        ownersCount++;
        required = 1;
    }

    function addProposal(
        address destination,
        uint value,
        string memory name,
        ProposalType typeName
    ) internal returns (uint) {
        Proposal memory proposal = Proposal(
            destination,
            value,
            false,
            name,
            typeName
        );
        proposals[proposalCount] = proposal;
        proposalCount++;
        emit ProposalCreated(proposalCount - 1);
        return proposalCount - 1;
    }

    function isOwner() internal view returns (bool) {
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == msg.sender) {
                return true;
            }
        }
        return false;
    }

    modifier needsToBeOwner() {
        require(isOwner());
        _;
    }

    function confirmProposal(uint proposalId) public needsToBeOwner {
        confirmations[proposalId][msg.sender] = true;
        emit ProposalConfirmed(proposalId);
    }

    function getConfirmationsCount(uint proposalId) public returns (uint) {
        uint confirmationsCount = 0;
        for (uint i = 0; i < owners.length; i++) {
            if (confirmations[proposalId][owners[i]]) {
                confirmationsCount++;
            }
        }
        emit ProposalCount(confirmationsCount);
        return confirmationsCount;
    }

    function submitProposal(
        address destination,
        uint value,
        string memory name,
        ProposalType typeName
    ) external {
        uint proposalId = addProposal(destination, value, name, typeName);
        confirmProposal(proposalId);
    }

    function isConfirmed(uint proposalId) public returns (bool) {
        uint confirmationsCount = getConfirmationsCount(proposalId);
        if (confirmationsCount >= required) return true;
        return false;
    }

    function compareStrings(
        string memory a,
        string memory b
    ) public pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function executeProposal(uint proposalId) public needsToBeOwner {
        require(
            !proposals[proposalId].executed,
            "This proposal has already been executed!"
        );
        require(isConfirmed(proposalId));

        ProposalType _type = proposals[proposalId].typeName;

        if (_type == ProposalType.Transaction) {
            executeTransaction(proposalId);
        } else if (_type == ProposalType.Required) {
            executeRequiredChange(proposalId);
        } else if (_type == ProposalType.AddOwner) {
            executeAddOwner(proposalId);
        } else if (_type == ProposalType.RemoveOwner) {
            executeRemoveOwner(proposalId);
        } else if (_type == ProposalType.SetDeposit) {
            executeSetDeposit(proposalId);
        } else if (_type == ProposalType.Withdraw) {
            withdrawAll(proposalId);
        }
        emit ProposalExecuted(proposalId);
    }

    function executeTransaction(uint proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        (bool success, ) = proposal.destination.call{value: proposal.value}("");
        require(success, "Failed to execute proposal");
        proposal.executed = true;
    }

    function executeRequiredChange(uint proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(
            proposal.value <= owners.length,
            "Owners count cant be less than new required value"
        );
        required = proposal.value;
        proposal.executed = true;
        emit RequiredChanged();
    }

    function executeAddOwner(uint proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        owners.push(proposal.destination);
        ownersCount++;
        proposal.executed = true;
        emit OwnersChanged();
    }

    function findAddress(address _target) public view returns (int) {
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == _target) {
                return int(i);
            }
        }
        return -1;
    }

    // Function to remove an element at a specific index from the array
    function removeAtIndex(uint index) public {
        require(index < owners.length, "Index out of bounds");

        // Shift elements to the left starting from the specified index
        for (uint i = index; i < owners.length - 1; i++) {
            owners[i] = owners[i + 1];
        }

        // Remove the last element (duplicate) and resize the array
        owners.pop();
    }

    function executeRemoveOwner(uint proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        int found = findAddress(proposal.destination);
        if (found != -1) {
            removeAtIndex(uint(found));
        }
        ownersCount--;
        proposal.executed = true;
        emit OwnersChanged();
    }

    function executeSetDeposit(uint proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        deposit = proposal.value;
        proposal.executed = true;
        emit DepositChanged();
    }

    receive() external payable {
        deposits[msg.sender] += msg.value;
        emit Received(msg.sender, msg.value);
    }

    function getContractBalance() public returns (uint) {
        emit ContractBalance(address(this).balance);
        return address(this).balance;
    }

    function howManyePaid() internal view returns (uint) {
        uint paid = 0;
        for (uint i = 0; i < owners.length; i++) {
            if (deposits[owners[i]] >= deposit) {
                paid++;
            }
        }
        return paid;
    }

    function withdrawAll(uint proposalId) public returns (uint) {
        Proposal storage proposal = proposals[proposalId];

        emit ContractBalance(address(this).balance);
        uint paidNum = howManyePaid();
        uint balanceDivided = address(this).balance / paidNum;
        for (uint i = 0; i < owners.length; i++) {
            if (deposits[owners[i]] >= deposit) {
                (bool success, ) = owners[i].call{value: balanceDivided}("");
                require(success, "Failed to execute proposal");
            }
        }
        proposal.executed = true;

        emit WithdrawAll();
        return address(this).balance;
    }
}

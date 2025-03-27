// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Voting
 * @dev A decentralized voting system where registered voters can propose, vote, abstain, and update their votes.
 * The contract ensures transparency and fairness while allowing different stages of the voting process.
 */
contract Voting is Ownable {

    /**
     * @dev Initializes the contract and sets the initial workflow status to RegisteringVoters.
     * Also auto-registers the contract deployer (admin) as a voter.
     */
    constructor() Ownable(msg.sender) {
        workflowStatus = WorkflowStatus.RegisteringVoters;
        voters[msg.sender].isRegistered = true;
        voterAddresses.push(msg.sender);
        emit VoterRegistered(msg.sender);
    }

    ///------------------------------------------------------------------------
    /// ENUMS & STRUCTS
    ///------------------------------------------------------------------------

    /**
     * @dev Enumeration representing different stages of the voting process.
     */
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /**
     * @dev Structure representing a voter.
     */
    struct Voter {
        bool isRegistered;
        mapping(uint => bool) votedProposals;
        mapping(uint => bool) abstainedProposals;
    }

    /**
     * @dev Structure representing a proposal.
     */
    struct Proposal {
        string description;
        uint voteCount;
    }

    /**
     * @dev Structure representing voting results.
     */
    struct VotingResult {
        uint winningProposalId;
        string winningProposalDescription;
        uint winningVoteCount;
        uint totalProposals;
    }

    ///------------------------------------------------------------------------
    /// STATE VARIABLES
    ///------------------------------------------------------------------------

    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    uint public winningProposalId;
    uint public abstentionsCount;
    Proposal[] public winningProposals;
    WorkflowStatus public workflowStatus;
    VotingResult[] public pastResults;
    address[] public voterAddresses;

    ///------------------------------------------------------------------------
    /// EVENTS
    ///------------------------------------------------------------------------

    event VoterRegistered(address indexed voterAddress);
    event VoterRemoved(address indexed voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint indexed proposalId);
    event Voted(address indexed voter, uint indexed proposalId);
    event VoteUpdated(address indexed voter, uint indexed newProposalId);
    event Abstained(address indexed voter);
    event VoteTallied(uint winningProposalId, string description, uint voteCount);

    ///------------------------------------------------------------------------
    /// MODIFIERS
    ///------------------------------------------------------------------------

    /**
     * @dev Modifier to restrict access to only registered voters.
     */
    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered, "You are not registered as a voter.");
        _;
    }

    /**
     * @dev Modifier to ensure function execution during the voting session.
     */
    modifier onlyDuringVotingSession() {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session is not active.");
        _;
    }

    /**
     * @dev Modifier to ensure function execution only after the voting session has ended.
     */
    modifier onlyAfterVotingSessionEnded() {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Voting session has not ended yet.");
        _;
    }

    ///------------------------------------------------------------------------
    /// READ FUNCTIONS
    ///------------------------------------------------------------------------

    /**
     * @notice Check if an address is registered as voter (publicly viewable).
     * @param _addr The address to check.
     * @return True if registered, false otherwise.
     */
    function isRegisteredVoter(address _addr) external view returns (bool) {
        return voters[_addr].isRegistered;
    }

    /**
     * @notice Retrieves if the voter is registered and if they abstained from a specific proposal.
     * @param _addr The address of the voter.
     * @param _proposalId The proposal ID to check abstention for.
     * @return isRegistered True if registered.
     * @return abstainedProposals True if abstained for that proposal.
     */
    function getVoterInfo(address _addr, uint _proposalId) external view onlyRegisteredVoter returns (bool isRegistered, bool abstainedProposals) {
        Voter storage voter = voters[_addr];
        return (voter.isRegistered, voter.abstainedProposals[_proposalId]);
    }

    /**
     * @notice Retrieves all registered voter addresses.
     * @dev Returns an array of Ethereum addresses currently registered as voters.
     * @return An array of addresses representing all registered voters.
     */
    function getAllVoters() external view returns (address[] memory) {
        return voterAddresses;
    }

    /**
     * @notice Check if a voter has voted for a specific proposal.
     * @param _addr The address of the voter.
     * @param _proposalId The proposal ID.
     * @return True if the voter voted for that proposal, false otherwise.
     */
    function hasVotedFor(address _addr, uint _proposalId) external view onlyRegisteredVoter returns (bool) {
        return voters[_addr].votedProposals[_proposalId];
    }

    /**
     * @notice Retrieves a specific proposal by its ID.
     * @param _id The proposal ID.
     * @return Proposal struct containing the proposal details.
     */
    function getOneProposal(uint _id) external view onlyRegisteredVoter returns (Proposal memory) {
        require(_id < proposals.length, "Proposal does not exist.");
        return proposals[_id];
    }

    /**
     * @notice Retrieves all proposals.
     * @return An array of Proposal structs.
     */
    function getAllProposals() public view returns (Proposal[] memory) {
        return proposals;
    }

    /**
     * @notice Returns the list of winning proposals.
     * @return An array of Proposal structs representing the winners.
     */
    function getWinners() public view returns (Proposal[] memory) {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Votes are not tallied yet.");
        return winningProposals;
    }

    /**
     * @notice Returns all past voting results.
     * @return An array of VotingResult structs.
     */
    function getPastResults() public view returns (VotingResult[] memory) {
        return pastResults;
    }


    ///------------------------------------------------------------------------
    /// WRITE FUNCTIONS
    ///------------------------------------------------------------------------

    /**
     * @notice Registers a voter.
     * @param _voterAddress The address of the voter to be registered.
     */
    function registerVoter(address _voterAddress) public onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Registration of voters is not allowed at this stage.");
        require(!voters[_voterAddress].isRegistered, "Voter is already registered.");
        voters[_voterAddress].isRegistered = true;
        voterAddresses.push(_voterAddress);

        emit VoterRegistered(_voterAddress);
    }


    /**
     * @notice Removes a voter.
     * @param _voterAddress The address of the voter to be removed.
     */
    function removeVoter(address _voterAddress) public onlyOwner {
        require(voters[_voterAddress].isRegistered, "Voter is not registered.");
        delete voters[_voterAddress];

        for (uint i = 0; i < voterAddresses.length; i++) {
            if (voterAddresses[i] == _voterAddress) {
                voterAddresses[i] = voterAddresses[voterAddresses.length - 1];
                voterAddresses.pop();
                break;
            }
        }

        emit VoterRemoved(_voterAddress);
    }

    /**
     * @notice Advances to the next workflow status.
     */
    function nextWorkflowStatus() public onlyOwner {
        require(workflowStatus != WorkflowStatus.VotesTallied, "Cannot proceed after final tally.");
        WorkflowStatus previousStatus = workflowStatus;
        workflowStatus = WorkflowStatus(uint(workflowStatus) + 1);
        emit WorkflowStatusChange(previousStatus, workflowStatus);
    }

    /**
     * @notice Registers a new proposal.
     * @param _description The description of the proposal.
     */
    function registerProposal(string memory _description) public onlyRegisteredVoter {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals are not allowed yet.");
        require(bytes(_description).length > 0, "Proposal description cannot be empty.");
        proposals.push(Proposal(_description, 0));
        emit ProposalRegistered(proposals.length - 1);
    }

    /**
     * @notice Allows a voter to cast a vote.
     * @param _proposalId The ID of the proposal to vote for.
     */
    function vote(uint _proposalId) public onlyDuringVotingSession onlyRegisteredVoter {
        require(_proposalId < proposals.length, "Invalid proposal ID.");
        require(!voters[msg.sender].abstainedProposals[_proposalId], "You have abstained from this proposal and cannot vote.");
        require(!voters[msg.sender].votedProposals[_proposalId], "You have already voted for this proposal.");

        proposals[_proposalId].voteCount++;
        voters[msg.sender].votedProposals[_proposalId] = true;

        emit Voted(msg.sender, _proposalId);
    }

    /**
     * @notice Allows a voter to remove their vote from a specific proposal.
     * @param _proposalId The ID of the proposal.
     */
    function removeVote(uint _proposalId) public onlyDuringVotingSession onlyRegisteredVoter {
        require(_proposalId < proposals.length, "Invalid proposal ID.");
        require(voters[msg.sender].votedProposals[_proposalId], "You haven't voted for this proposal.");
        voters[msg.sender].votedProposals[_proposalId] = false;
        proposals[_proposalId].voteCount--;
        emit VoteUpdated(msg.sender, _proposalId);
    }

    /**
     * @notice Allows a voter to abstain from a specific proposal.
     * @param _proposalId The ID of the proposal to abstain from.
     */
    function abstain(uint _proposalId) public onlyDuringVotingSession onlyRegisteredVoter {
        require(_proposalId < proposals.length, "Invalid proposal ID.");
        require(!voters[msg.sender].votedProposals[_proposalId], "Already voted on this proposal.");
        require(!voters[msg.sender].abstainedProposals[_proposalId], "Already abstained from this proposal.");

        voters[msg.sender].abstainedProposals[_proposalId] = true;
        proposals[_proposalId].voteCount += 0;
        abstentionsCount++;

        emit Abstained(msg.sender);
    }

    /**
     * @notice Tallies votes and determines the winning proposal(s).
     */
    function tallyVotes() public onlyOwner onlyAfterVotingSessionEnded {
        uint highestCount = 0;
        delete winningProposals;

        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > highestCount) {
                highestCount = proposals[i].voteCount;
                delete winningProposals;
                winningProposals.push(proposals[i]);
                winningProposalId = i;
            } else if (proposals[i].voteCount == highestCount && highestCount > 0) {
                winningProposals.push(proposals[i]);
            }
        }

        pastResults.push(VotingResult({
            winningProposalId: winningProposalId,
            winningProposalDescription: proposals[winningProposalId].description,
            winningVoteCount: proposals[winningProposalId].voteCount,
            totalProposals: proposals.length
        }));

        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
        emit VoteTallied(winningProposalId, proposals[winningProposalId].description, proposals[winningProposalId].voteCount);
    }

    /**
     * @notice Resets the voting session so a new one can start.
     * This will clear all proposals, votes, and results,
     * and set the workflow back to the first step.
     */
    function resetVotingSession() public onlyOwner {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Cannot reset before tallying.");

        delete proposals;
        delete winningProposals;
        winningProposalId = 0;
        abstentionsCount = 0;

        for (uint i = 0; i < voterAddresses.length; i++) {
            address voterAddr = voterAddresses[i];
            for (uint j = 0; j < 100; j++) {
                voters[voterAddr].votedProposals[j] = false;
                voters[voterAddr].abstainedProposals[j] = false;
            }
        }

        workflowStatus = WorkflowStatus.RegisteringVoters;

        emit WorkflowStatusChange(WorkflowStatus.VotesTallied, WorkflowStatus.RegisteringVoters);
    }
}
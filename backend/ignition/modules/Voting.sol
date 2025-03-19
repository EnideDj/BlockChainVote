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
     */
    constructor() Ownable(msg.sender) {
        workflowStatus = WorkflowStatus.RegisteringVoters;
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
        bool hasVoted;
        bool hasAbstained;
        uint votedProposalId;
    }
    
    /**
     * @dev Structure representing a proposal.
     */
    struct Proposal {
        string description;
        uint voteCount;
    }

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
    
    ///------------------------------------------------------------------------
    /// EVENTS
    ///------------------------------------------------------------------------
    
    /**
     * @dev Events emitted during contract operations.
     */
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
    /// FUNCTIONS
    ///------------------------------------------------------------------------
    
    /**
     * @notice Retrieves voter details by address.
     * @param _addr The address of the voter.
     * @return Voter struct containing voter information.
     */
    function getVoter(address _addr) external view onlyRegisteredVoter returns (Voter memory) {
        return voters[_addr];
    }

    /**
     * @notice Retrieves the proposal ID that a voter has voted for.
     * @param _addr The address of the voter.
     * @return The ID of the proposal the voter voted for.
     */
    function getVoterVote(address _addr) external view onlyRegisteredVoter returns (uint) {
        require(voters[_addr].hasVoted, "This voter has not voted yet.");
        return voters[_addr].votedProposalId;
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
     * @notice Registers a voter.
     * @param _voterAddress The address of the voter to be registered.
     */
    function registerVoter(address _voterAddress) public onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Registration of voters is not allowed at this stage.");
        require(!voters[_voterAddress].isRegistered, "Voter is already registered.");
        voters[_voterAddress].isRegistered = true;
        emit VoterRegistered(_voterAddress);
    }
    
    /**
     * @notice Removes a voter.
     * @param _voterAddress The address of the voter to be removed.
     */
    function removeVoter(address _voterAddress) public onlyOwner {
        require(voters[_voterAddress].isRegistered, "Voter is not registered.");
        delete voters[_voterAddress];
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
        require(!voters[msg.sender].hasVoted, "You have already voted.");
        require(!voters[msg.sender].hasAbstained, "You have abstained and cannot vote.");

        proposals[_proposalId].voteCount++;
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;

        emit Voted(msg.sender, _proposalId);
    }
    
    /**
     * @notice Allows a voter to update their vote.
     * @param _newProposalId The ID of the new proposal to vote for.
     */
    function updateVote(uint _newProposalId) public onlyDuringVotingSession onlyRegisteredVoter {
        require(voters[msg.sender].hasVoted, "You have not voted yet.");
        require(_newProposalId < proposals.length, "Invalid proposal ID.");
        
        proposals[voters[msg.sender].votedProposalId].voteCount--;
        proposals[_newProposalId].voteCount++;
        voters[msg.sender].votedProposalId = _newProposalId;
        
        emit VoteUpdated(msg.sender, _newProposalId);
    }

    /**
     * @notice Allows a voter to abstain from voting.
     */
    function abstain() public onlyDuringVotingSession onlyRegisteredVoter {
        require(!voters[msg.sender].hasVoted, "You have already voted.");
        require(!voters[msg.sender].hasAbstained, "You have already abstained.");

        voters[msg.sender].hasAbstained = true;
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
            } else if (proposals[i].voteCount == highestCount && highestCount > 0) {
                winningProposals.push(proposals[i]);
            }
        }

        winningProposalId = winningProposals.length > 0 ? proposals.length - 1 : 0;
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
     * @notice Returns the list of winning proposals.
     * @return An array of Proposal structs representing the winners.
     */
    function getWinners() public view returns (Proposal[] memory) {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Votes are not tallied yet.");
        return winningProposals;
    }
    
    function getPastResults() public view returns (VotingResult[] memory) {
        return pastResults;
    }
    /**
     * @notice Checks if a voter has voted.
     * @return A boolean indicating if the voter has voted.
     */
    function hasVoted() public view returns (bool) {
        return voters[msg.sender].hasVoted;
    }
}
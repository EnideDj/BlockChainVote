const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Smart Contract", function () {
    let voting;
    let owner, voter1, voter2, voter3;

    beforeEach(async function () {
        [owner, voter1, voter2, voter3] = await ethers.getSigners();
        const VotingFactory = await ethers.getContractFactory("Voting");
        voting = await VotingFactory.deploy();
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await voting.owner()).to.equal(owner.address);
        });
    });

    describe("Voter Registration", function () {
        it("Should allow owner to register voters during the registering stage", async function () {
            await voting.registerVoter(voter1.address);
            const [isRegistered] = await voting.getVoterInfo(voter1.address, 0);
            expect(isRegistered).to.equal(true);
        });

        it("Should prevent registering voters when not in the RegisteringVoters stage", async function () {
            await voting.nextWorkflowStatus();
            await expect(voting.registerVoter(voter1.address)).to.be.revertedWith(
                "Registration of voters is not allowed at this stage."
            );
        });
    });

    describe("Proposal Registration", function () {
        beforeEach(async function () {
            await voting.registerVoter(voter1.address);
            await voting.nextWorkflowStatus();
        });

        it("Should allow a registered voter to submit a proposal", async function () {
            await voting.connect(voter1).registerProposal("New Proposal");
            const proposal = await voting.getOneProposal(0);
            expect(proposal.description).to.equal("New Proposal");
        });

        it("Should prevent non-registered voter from submitting a proposal", async function () {
            await expect(
                voting.connect(voter2).registerProposal("Proposal from non-registered voter")
            ).to.be.revertedWith("You are not registered as a voter.");
        });

        it("Should prevent submitting proposals when not in ProposalsRegistrationStarted stage", async function () {
            await voting.nextWorkflowStatus();
            await expect(
                voting.connect(voter1).registerProposal("Proposal when not allowed")
            ).to.be.revertedWith("Proposals are not allowed yet.");
        });
    });

    describe("Voting Process", function () {
        beforeEach(async function () {
            const VotingFactory = await ethers.getContractFactory("Voting");
            voting = await VotingFactory.deploy();
            await voting.registerVoter(voter1.address);
            await voting.registerVoter(voter2.address);

            await voting.nextWorkflowStatus();
            await voting.connect(voter1).registerProposal("Proposal 1");
            await voting.connect(voter2).registerProposal("Proposal 2");

            await voting.nextWorkflowStatus();
            await voting.nextWorkflowStatus();
        });

        it("Should allow registered voters to vote", async function () {
            await expect(voting.connect(voter1).vote(0))
                .to.emit(voting, "Voted")
                .withArgs(voter1.address, 0);
        });

        it("Should prevent double voting on the same proposal", async function () {
            await voting.connect(voter1).vote(0);
            await expect(voting.connect(voter1).vote(0)).to.be.revertedWith(
                "You have already voted for this proposal."
            );
        });

        it("Should allow voters to abstain", async function () {
            await expect(voting.connect(voter2).abstain(0))
                .to.emit(voting, "Abstained")
                .withArgs(voter2.address);
        });

        it("Should prevent voting when not in VotingSessionStarted stage", async function () {
            await voting.nextWorkflowStatus();
            await expect(voting.connect(voter1).vote(0))
                .to.be.revertedWith("Voting session is not active.");
        });

        it("Should allow voters to remove their vote", async function () {
            await voting.connect(voter1).vote(0);

            await expect(voting.connect(voter1).removeVote(0))
                .to.emit(voting, "VoteUpdated")
                .withArgs(voter1.address, 0);

            const hasVoted = await voting.hasVotedFor(voter1.address, 0);
            expect(hasVoted).to.equal(false);
        });

        it("Should prevent abstention after voting", async function () {
            await voting.connect(voter1).vote(0);
            await expect(voting.connect(voter1).abstain(0)).to.be.revertedWith(
                "Already voted on this proposal."
            );
        });
    });

    describe("Workflow Transitions", function () {
        it("Should go through the entire workflow correctly", async function () {
            expect(await voting.workflowStatus()).to.equal(0);

            await expect(voting.nextWorkflowStatus()).to.emit(voting, "WorkflowStatusChange").withArgs(0, 1);
            await expect(voting.nextWorkflowStatus()).to.emit(voting, "WorkflowStatusChange").withArgs(1, 2);
            await expect(voting.nextWorkflowStatus()).to.emit(voting, "WorkflowStatusChange").withArgs(2, 3);
            await expect(voting.nextWorkflowStatus()).to.emit(voting, "WorkflowStatusChange").withArgs(3, 4);
            await expect(voting.nextWorkflowStatus()).to.emit(voting, "WorkflowStatusChange").withArgs(4, 5);

            await expect(voting.nextWorkflowStatus()).to.be.revertedWith("Cannot proceed after final tally.");
        });
    });

    describe("Tallying Votes", function () {
        beforeEach(async function () {
            await voting.registerVoter(voter1.address);
            await voting.registerVoter(voter2.address);

            await voting.nextWorkflowStatus();
            await voting.connect(voter1).registerProposal("Proposal 1");
            await voting.connect(voter2).registerProposal("Proposal 2");

            await voting.nextWorkflowStatus();
            await voting.nextWorkflowStatus();

            await voting.connect(voter1).vote(0);
            await voting.connect(voter2).vote(1);

            await voting.nextWorkflowStatus();
        });

        it("Should tally votes correctly", async function () {
            await expect(voting.tallyVotes()).to.emit(voting, "VoteTallied");
            const winners = await voting.getWinners();
            expect(winners.length).to.be.equal(2);
            const pastResults = await voting.getPastResults();
            expect(pastResults.length).to.equal(1);
            expect(pastResults[0].totalProposals).to.equal(2);
        });

        it("Should set the correct winning proposal ID after tally", async function () {
            await voting.tallyVotes();
            const winningProposalId = await voting.winningProposalId();
            expect(Number(winningProposalId)).to.be.oneOf([0, 1]);
        });
    });

    describe("Removing Registered Voter", function () {
        beforeEach(async function () {
            await voting.registerVoter(voter1.address);
        });

        it("Should allow owner to remove a voter", async function () {
            await expect(voting.removeVoter(voter1.address))
                .to.emit(voting, "VoterRemoved")
                .withArgs(voter1.address);
            const isRegistered = await voting.isRegisteredVoter(voter1.address);
            expect(isRegistered).to.be.false;
        });

        it("Should prevent removed voter from participating", async function () {
            await voting.removeVoter(voter1.address);
            await voting.nextWorkflowStatus();
            await expect(voting.connect(voter1).registerProposal("Invalid Proposal"))
                .to.be.revertedWith("You are not registered as a voter.");
        });

        it("Should correctly update voterAddresses after removal", async function () {
            await voting.removeVoter(voter1.address);
            const votersList = await voting.getAllVoters();
            expect(votersList).to.not.include(voter1.address);
        });
    });

    describe("Historical Results", function () {
        beforeEach(async function () {
            await voting.registerVoter(voter1.address);

            await voting.nextWorkflowStatus();
            await voting.connect(voter1).registerProposal("Historical Proposal");
            await voting.nextWorkflowStatus();
            await voting.nextWorkflowStatus();

            await voting.connect(voter1).vote(0);
            await voting.nextWorkflowStatus();
            await voting.tallyVotes();
        });

        it("Should store past voting results", async function () {
            const results = await voting.getPastResults();
            expect(results.length).to.equal(1);
            expect(results[0].winningVoteCount).to.equal(1);
            expect(results[0].winningProposalDescription).to.equal("Historical Proposal");
        });
    });

    describe("Reset Voting Session", function () {
        beforeEach(async function () {
            await voting.connect(owner).registerVoter(voter1.address);
            await voting.connect(owner).registerVoter(voter2.address);

            await voting.nextWorkflowStatus();
            await voting.connect(voter1).registerProposal("Reset Test Proposal 1");
            await voting.connect(voter2).registerProposal("Reset Test Proposal 2");

            await voting.nextWorkflowStatus();
            await voting.nextWorkflowStatus();
            await voting.connect(voter1).vote(0);
            await voting.connect(voter2).vote(1);
            await voting.nextWorkflowStatus();

            await voting.tallyVotes();
        });

        it("Should reset the contract state", async function () {
            await voting.resetVotingSession();

            const status = await voting.workflowStatus();
            expect(status).to.equal(0);

            const proposals = await voting.getAllProposals();
            expect(proposals.length).to.equal(0);

            const past = await voting.getPastResults();
            expect(past.length).to.equal(1);

            const [isStillRegistered] = await voting.getVoterInfo(voter1.address, 0);
            expect(isStillRegistered).to.be.true;

            await voting.nextWorkflowStatus();
            await voting.connect(voter1).registerProposal("Nouvelle prop");
            await voting.nextWorkflowStatus();
            await voting.nextWorkflowStatus();

            const hasVoted = await voting.hasVotedFor(voter1.address, 0);
            expect(hasVoted).to.be.false;
        });

        it("Should revert if trying to reset before tallying", async function () {
            const VotingFactory = await ethers.getContractFactory("Voting");
            const newVoting = await VotingFactory.deploy();

            await expect(newVoting.resetVotingSession()).to.be.revertedWith(
                "Cannot reset before tallying."
            );
        });
    });
});

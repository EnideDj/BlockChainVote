const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Smart Contract", function () {
    let voting;
    let owner, voter1, voter2, voter3;

    beforeEach(async function () {
        [owner, voter1, voter2, voter3] = await ethers.getSigners();
        const VotingFactory = await ethers.getContractFactory("Voting");
        voting = await VotingFactory.deploy();
        await voting.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await voting.owner()).to.equal(owner.address);
        });
    });

    describe("Voter Registration", function () {
        it("Should allow owner to register voters", async function () {
            await voting.registerVoter(owner.address);
            await voting.registerVoter(voter1.address);
            const voter = await voting.getVoter(voter1.address);
            expect(voter.isRegistered).to.be.true;
        });

        it("Should prevent duplicate registration", async function () {
            await voting.registerVoter(voter1.address);

            await expect(voting.registerVoter(voter1.address)).to.be.revertedWith(
                "Voter is already registered."
            );
        });
    });

    describe("Proposal Registration", function () {
        beforeEach(async function () {
            await voting.registerVoter(owner.address);
            await voting.registerVoter(voter1.address);
            await voting.nextWorkflowStatus();
        });

        it("Should allow a registered voter to submit a proposal", async function () {
            await voting.connect(voter1).registerProposal("Proposal 1");
            const proposal = await voting.getOneProposal(0);
            expect(proposal.description).to.equal("Proposal 1");
        });

        it("Should prevent non-registered voter from submitting a proposal", async function () {
            await expect(
                voting.connect(voter2).registerProposal("Proposal 2")
            ).to.be.revertedWith("You are not registered as a voter.");
        });
    });

    describe("Voting Process", function () {
        beforeEach(async function () {
            await voting.registerVoter(owner.address);
            await voting.registerVoter(voter1.address);
            await voting.registerVoter(voter2.address);
            await voting.registerVoter(voter3.address);
            await voting.nextWorkflowStatus();
            await voting.connect(voter1).registerProposal("Proposal 1");
            await voting.nextWorkflowStatus();
            await voting.nextWorkflowStatus();
        });

        it("Should allow registered voters to vote", async function () {
            await voting.connect(voter1).vote(0);
            const voter = await voting.getVoter(voter1.address);
            expect(voter.hasVoted).to.equal(true);
        });

        it("Should prevent double voting", async function () {
            await voting.vote(0);
            await expect(voting.vote(0)).to.be.revertedWith("You have already voted.");
        });

        it("Should allow abstention", async function () {
            await voting.connect(voter1).abstain();
            const voter = await voting.getVoter(voter1.address);
            expect(voter.hasAbstained).to.equal(true);
        });
    });

    describe("Vote Tallying", function () {
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
        
        it("Should tally votes and determine the winner", async function () {
            await voting.tallyVotes();
            const winners = await voting.getWinners();
            expect(winners.length).to.be.at.least(1);
        });
    });

    describe("History of Votes", function () {
        beforeEach(async function () {
            await voting.registerVoter(voter1.address);
            await voting.registerVoter(voter2.address);
            await voting.nextWorkflowStatus();
            await voting.connect(voter1).registerProposal("Proposal 1");
            await voting.nextWorkflowStatus();
            await voting.nextWorkflowStatus();
            await voting.connect(voter1).vote(0);
            await voting.connect(voter2).vote(0);
            await voting.nextWorkflowStatus();
            await voting.tallyVotes();
        });

        it("Should store past results", async function () {
            const pastResults = await voting.getPastResults();
            expect(pastResults.length).to.be.greaterThan(0);
        });
    });
});
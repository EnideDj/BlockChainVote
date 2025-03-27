import { ethers } from "hardhat"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Déploiement par :", deployer.address)

    const balance = await ethers.provider.getBalance(deployer.address)
    console.log("Solde :", ethers.formatEther(balance), "ETH")

    const Voting = await ethers.getContractFactory("Voting", deployer)

    const gasEstimate = await Voting.deploy().then((tx) => tx.deploymentTransaction()?.gasLimit)
    console.log("Estimation du gas limit :", gasEstimate?.toString())

    const contract = await Voting.deploy()
    await contract.waitForDeployment()

    console.log("Contrat Voting déployé à :", await contract.getAddress())
}

main().catch((error) => {
    console.error("Erreur de déploiement :", error)
    process.exit(1)
})
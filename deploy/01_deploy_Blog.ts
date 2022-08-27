import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat.config";
import { verify } from "../utils/verify";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const args = ["DecenBlog"];

    const blog = await deploy("Blog", {
        from: deployer,
        args,
        log: true,
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(blog.address, args);
        log("Verified");
    }

    log("--------------------------------------------------------");
};

export default deployFunc;
deployFunc.tags = ["all"];

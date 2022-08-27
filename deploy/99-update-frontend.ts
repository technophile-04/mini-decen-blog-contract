import { artifacts, ethers, network } from "hardhat";
import fs from "fs";
import path from "path";
import { DeployFunction } from "hardhat-deploy/dist/types";

interface ICurrentAddresses {
    [key: string]: string[];
}

const contractDir: string = path.join("..", "blog-frontend", "contracts");
const FRONTEND_LOCATION_ADDRESSES_FILE: string = path.join(contractDir, "contract-addresses.json");
const FRONTEND_LOCATION_ABI_FILE: string = path.join(contractDir, "Blog.json");

const deployFunc: DeployFunction = async () => {
    if (process.env.UPDATE_FRONTEND) {
        console.log("Update frontend", contractDir);
    }

    if (!fs.existsSync(contractDir)) {
        fs.mkdirSync(contractDir);
    }

    await updateContractAddresses();
    await updateABI();
};

const updateABI = async () => {
    const Blog = artifacts.readArtifactSync("Blog");

    fs.writeFileSync(FRONTEND_LOCATION_ABI_FILE, JSON.stringify(Blog, null, 2));
};

const updateContractAddresses = async () => {
    const blog = await ethers.getContract("Blog");
    const chainId = network.config.chainId?.toString()!;

    if (!fs.existsSync(FRONTEND_LOCATION_ADDRESSES_FILE)) {
        fs.writeFileSync(
            FRONTEND_LOCATION_ADDRESSES_FILE,
            JSON.stringify({
                [chainId]: [blog.address],
            })
        );
    } else {
        const currentAddresses: ICurrentAddresses = JSON.parse(
            fs.readFileSync(FRONTEND_LOCATION_ADDRESSES_FILE, "utf8")
        );

        if (chainId in currentAddresses) {
            if (!currentAddresses[chainId].includes(blog.address)) {
                currentAddresses[chainId].push(blog.address);
            }
        } else {
            currentAddresses[chainId] = [blog.address];
        }

        fs.writeFileSync(FRONTEND_LOCATION_ADDRESSES_FILE, JSON.stringify(currentAddresses));
    }
};
export default deployFunc;
deployFunc.tags = ["all", "frontend"];

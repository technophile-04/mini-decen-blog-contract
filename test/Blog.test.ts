import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, assert } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { Blog } from "../typechain-types";

describe("Blog", function () {
    let blog: Blog;
    let deployer: string;
    let secondPerson: SignerWithAddress;

    beforeEach(async () => {
        await deployments.fixture(["all"]);
        blog = await ethers.getContract("Blog");
        deployer = (await getNamedAccounts()).deployer;
        secondPerson = (await ethers.getSigners())[1];
    });

    it("createPost and log event", async () => {
        // Checking for onlyOwner
        await expect(
            blog.connect(secondPerson).createPost("Hello", "Qjljfjsdsdjsf")
        ).to.be.revertedWith("Only owner can call this");

        const title = "Blockchain";
        const txnReceipt = await blog.createPost(title, "Qjljfjsdsdjsf");
        const txnRes = await txnReceipt.wait();
        assert.strictEqual(txnRes.events![0].args?.title, title);
    });

    it("update post and log postUpdated", async () => {
        let title = "Blockchain";
        let txnReceipt = await blog.createPost(title, "Qjljfjsdsdjsf");
        let txnRes = await txnReceipt.wait();

        title = "FadChain";
        txnReceipt = await blog.updatePost("1", title, "Qjljfjsdsdjsl", true);
        txnRes = await txnReceipt.wait();

        assert.strictEqual(txnRes.events![0].args?.title, title);
    });

    it("able to  donate to post", async () => {
        let title = "Blockchain";
        let txnReceipt = await blog.createPost(title, "Qjljfjsdsdjsf");
        let txnRes = await txnReceipt.wait();

        txnReceipt = await blog
            .connect(secondPerson)
            .donateToPost("1", { value: ethers.utils.parseEther("0.1") });
        txnReceipt = await blog
            .connect(secondPerson)
            .donateToPost("1", { value: ethers.utils.parseEther("0.1") });
        txnRes = await txnReceipt.wait();

        console.log(
            "Recent donated amount from events",
            txnRes.events![0].args?.donation.toString()
        );

        const currentPost = await blog.fetchPost("1");

        assert.strictEqual(currentPost.donation, ethers.utils.parseEther("0.2"));
    });

    it("allow only owner to withdraw", async () => {
        let title = "Blockchain";
        let txnReceipt = await blog.createPost(title, "Qjljfjsdsdjsf");
        let txnRes = await txnReceipt.wait();
        let prevBalance = await ethers.provider.getBalance(deployer);

        txnReceipt = await blog
            .connect(secondPerson)
            .donateToPost("1", { value: ethers.utils.parseEther("1") });
        txnReceipt = await blog
            .connect(secondPerson)
            .donateToPost("1", { value: ethers.utils.parseEther("1") });

        await expect(blog.connect(secondPerson).withdraw()).to.be.revertedWith(
            "Only owner can call this"
        );

        txnReceipt = await blog.withdraw();
        txnRes = await txnReceipt.wait();

        const newBalance = await ethers.provider.getBalance(deployer);

        expect(newBalance).to.be.greaterThan(prevBalance);
    });
});

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-solhint';

const config: HardhatUserConfig = {
	solidity: {
		compilers: [
			{
				version: '0.8.9',
			},
			{
				version: '0.7.0',
			},
		],
	},
	defaultNetwork: 'hardhat',
	networks: {
		rinkeby: {
			url: process.env.RINKEBY_RPC_URL || '',
			accounts:
				process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
			chainId: 4,
		},
		localhost: {
			chainId: 31337,
		},
	},
	gasReporter: {
		enabled: process.env.REPORT_GAS !== undefined,
		currency: 'USD',
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
		player: {
			default: 1,
		},
	},
	mocha: {
		timeout: 500000,
	},
};

export default config;

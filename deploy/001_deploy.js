// require("dotenv").config();

// const func = async function (hre) {
//     const { deployments, getNamedAccounts } = hre;
//     const { deploy } = deployments;

//     const { deployer } = await getNamedAccounts();

//     if (
//         hre.hardhatArguments.network == "main" ||
//         hre.hardhatArguments.network == "maticMain" ||
//         hre.hardhatArguments.network == "bscMain"
//     ) {
//         await run("remove-logs");
//         deployer = process.env.PRIVATE_KEY
//     }

//     const contract = await deploy('Chorus', {
//         from: deployer,
//         log: true,
//         deterministicDeployment: true,
//         args: [],
//     });

//     console.log("contract deployed to:", hre.network.config.explorer + contract.address);
// };

// module.exports = func;
// func.tags = ['TellorAccess'];




//Run this commands to deploy tellor playground:
//npx hardhat deploy --name "tellor" --symbol "PTRB" --net rinkeby --network rinkeby
//npx hardhat deploy --name "tellor" --symbol "PTRB" --net mainnet --network mainnet
//npx hardhat deploy --name tellor --symbol PTRB --net bsc_testnet --network bsc_testnet

// task("deploy", "Deploy and verify the contracts")
//   .addParam("name", "coin name")
//   .addParam("symbol", "coin symbol")
//   .addParam("net", "network to deploy in")
//   .setAction(async taskArgs => {


//     console.log("deploy telloraccess")
//     var name = taskArgs.name
//     var symbol = taskArgs.symbol
//     var net = taskArgs.network

//     await run("compile");
//     const Tellor = await ethers.getContractFactory("TellorAccess");
//     const tellor= await Tellor.deploy(name, symbol);
//     console.log("Tellor deployed to:", tellor.address);
//     await tellor.deployed();

//     if (net == "mainnet"){
//         console.log("Tellor contract deployed to:", "https://etherscan.io/address/" + tellor.address);
//         console.log("    transaction hash:", "https://etherscan.io/tx/" + tellor.deployTransaction.hash);
//     } else if (net == "rinkeby") {
//         console.log("Tellor contract deployed to:", "https://rinkeby.etherscan.io/address/" + tellor.address);
//         console.log("    transaction hash:", "https://rinkeby.etherscan.io/tx/" + tellor.deployTransaction.hash);
//     } else if (net == "bsc_testnet") {
//         console.log("Tellor contract deployed to:", "https://testnet.bscscan.com/address/" + tellor.address);
//         console.log("    transaction hash:", "https://testnet.bscscan.com/tx/" + tellor.deployTransaction.hash);
//     } else if (net == "bsc") {
//     console.log("Tellor contract deployed to:", "https://bscscan.com/address/" + tellor.address);
//     console.log("    transaction hash:", "https://bscscan.com/tx/" + tellor.deployTransaction.hash);
//     } else {
//         console.log("Please add network explorer details")
//     }


//     // Wait for few confirmed transactions.
//     // Otherwise the etherscan api doesn't find the deployed contract.
//     console.log('waiting for tx confirmation...');
//     await tellor.deployTransaction.wait(3)

//     console.log('submitting contract for verification...');

//     await run("verify:verify", {
//       address: tellor.address,
//       constructorArguments: [name, symbol]
//     },
//     )

//     console.log("Contract verified")

//   });

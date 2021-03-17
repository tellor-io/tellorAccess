const TellorPlayground = artifacts.require("TellorAccess");

module.exports = function (deployer) {
  deployer.deploy(TellorPlayground,"TellorAccess","PTRB");
};

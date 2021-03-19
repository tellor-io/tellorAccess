const TellorAccess = artifacts.require("TellorAccess");

module.exports = function (deployer) {
  deployer.deploy(TellorAccess);
};

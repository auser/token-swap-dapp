var Migrations = artifacts.require("./Migrations.sol");

const OWNER_ACCOUNT = process.env.OWNER_ACCOUNT

module.exports = function(deployer, environment, [owner]) {
  deployer.deploy(Migrations);
};

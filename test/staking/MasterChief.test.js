const {
  BN,
  expectEvent,
  expectRevert,
  expect,
  getCore,
  getAddresses,
  getWeb3Addresses,
} = require('../helpers');
const { time } = require('@openzeppelin/test-helpers');

const Tribe = artifacts.require('MockTribe');
const MockCoreRef = artifacts.require('MockCoreRef');
const MasterChief = artifacts.require('MasterChief');
const MockERC20 = artifacts.require('MockERC20');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe('MasterChief', function () {
  let pid;
  let userAddress;
  let minterAddress;
  let governorAddress;
  let secondUserAddress;
  let thirdUserAddress;
  let accounts;

  const allocationPoints = 100;
  const totalStaked = '100000000000000000000';
  const perBlockReward = Number(100000000000000000000);

  beforeEach(async function () {
    ({
      userAddress,
      minterAddress,
      burnerAddress,
      pcvControllerAddress,
      governorAddress,
      genesisGroup,
      guardianAddress,
    } = await getAddresses());
    accounts = await getWeb3Addresses();
    secondUserAddress = accounts[0];
    thirdUserAddress = accounts[1];

    this.core = await getCore(false);

    this.tribe = await Tribe.new();
    this.coreRef = await MockCoreRef.new(this.core.address);

    this.masterChief = await MasterChief.new(this.core.address, this.tribe.address);

    // mint LP tokens
    this.LPToken = await MockERC20.new();
         await this.LPToken.mint(userAddress, '1000000000000000000000000000000000000000000000');
   await this.LPToken.mint(secondUserAddress, '1000000000000000000000000000000000000000000000');
    await this.LPToken.mint(thirdUserAddress, '1000000000000000000000000000000000000000000000');
    await this.tribe.mint(this.masterChief.address, '1000000000000000000000000000000000000000000000', { from: minterAddress });

    // create new reward stream
    const tx = await this.masterChief.add(allocationPoints, this.LPToken.address, ZERO_ADDRESS, { from: governorAddress });
    // grab PID from the logs
    pid = Number(tx.logs[0].args.pid);

    this.minterRole = await this.core.MINTER_ROLE();
    this.burnerRole = await this.core.BURNER_ROLE();
    this.governorRole = await this.core.GOVERN_ROLE();
    this.pcvControllerRole = await this.core.PCV_CONTROLLER_ROLE();
    this.guardianRole = await this.core.GUARDIAN_ROLE();
  });

  describe('Test Security', function() {
    it('should not be able to add rewards stream as non governor', async function() {
        await expectRevert(
            this.masterChief.add(allocationPoints, this.LPToken.address, this.tribe.address, { from: userAddress }),
            "CoreRef: Caller is not a governor",
        );
    });

    it('should not be able to set rewards stream as non governor', async function() {
        await expectRevert(
            this.masterChief.set(0, allocationPoints, this.LPToken.address, true, { from: userAddress }),
            "CoreRef: Caller is not a governor",
        );
    });

    it('should not be able to setMigrator as non governor', async function() {
        await expectRevert(
            this.masterChief.setMigrator(this.LPToken.address, { from: userAddress }),
            "CoreRef: Caller is not a governor",
        );
    });

    it('should not be able to governorWithdrawTribe as non governor', async function() {
        await expectRevert(
            this.masterChief.governorWithdrawTribe('100000000', { from: userAddress }),
            "CoreRef: Caller is not a governor",
        );
    });

    it('should not be able to updateBlockReward as non governor', async function() {
        await expectRevert(
            this.masterChief.updateBlockReward('100000000', { from: userAddress }),
            "CoreRef: Caller is not a governor",
        );
    });
  });

  describe('Test Staking', function() {
    it('should be able to stake LP Tokens', async function() {
        await this.LPToken.approve(this.masterChief.address, totalStaked);
        await this.masterChief.deposit(pid, totalStaked, userAddress, { from: userAddress })
    });

    it('should be able to get pending sushi', async function() {
        await this.LPToken.approve(this.masterChief.address, totalStaked);
        await this.masterChief.deposit(pid, totalStaked, userAddress, { from: userAddress });

        const advanceBlockAmount = 100;
        for (let i = 0; i < advanceBlockAmount; i++) {
            await time.advanceBlock();
        }

        expect(Number(await this.masterChief.pendingSushi(pid, userAddress))).to.be.equal(perBlockReward * advanceBlockAmount);
    });

    it('should be able to get pending sushi after one block with a single pool and user staking', async function() {
        await this.LPToken.approve(this.masterChief.address, totalStaked);
        await this.masterChief.deposit(pid, totalStaked, userAddress, { from: userAddress });

        await time.advanceBlock();

        expect(Number(await this.masterChief.pendingSushi(pid, userAddress))).to.be.equal(perBlockReward);
    });

    it('should be able to get pending sushi 200 blocks', async function() {
        await this.LPToken.approve(this.masterChief.address, totalStaked);
        await this.masterChief.deposit(pid, totalStaked, userAddress, { from: userAddress });

        const advanceBlockAmount = 200;
        for (let i = 0; i < advanceBlockAmount; i++) {
            await time.advanceBlock();
        }

        console.log("pending sushi after 200 blocks for one user staking: ", Number(await this.masterChief.pendingSushi(pid, userAddress)));
        expect(Number(await this.masterChief.pendingSushi(pid, userAddress))).to.be.equal(perBlockReward * advanceBlockAmount);

        console.log('tribe balance befor harvest: ', Number(await this.tribe.balanceOf(secondUserAddress)));
        await this.masterChief.harvest(pid, secondUserAddress, { from: secondUserAddress });
        console.log('tribe balance after harvest: ', Number(await this.tribe.balanceOf(secondUserAddress)));
    });

    it('should be able to distribute sushi after 200 blocks with 3 users staking', async function() {
        // user one actions
        await this.LPToken.approve(this.masterChief.address, totalStaked, { from: userAddress });
        await this.masterChief.deposit(pid, totalStaked, userAddress, { from: userAddress });

        // user two actions
        await this.LPToken.approve(this.masterChief.address, totalStaked, { from: secondUserAddress });
        await this.masterChief.deposit(pid, totalStaked, secondUserAddress, { from: secondUserAddress });

        // user three actions
        await this.LPToken.approve(this.masterChief.address, totalStaked, { from: thirdUserAddress });
        await this.masterChief.deposit(pid, totalStaked, thirdUserAddress, { from: thirdUserAddress });

        const advanceBlockAmount = 200;
        for (let i = 0; i < advanceBlockAmount; i++) {
            await time.advanceBlock();
        }

        await this.masterChief.deposit(pid, 0, thirdUserAddress, { from: thirdUserAddress });
        // console.log(`sushi provided user1: ${Number((await this.masterChief.userInfo(pid, userAddress)).amount)} reward debt ${Number((await this.masterChief.userInfo(pid, userAddress)).rewardDebt)}`);
        // console.log(`sushi provided user2:  ${Number((await this.masterChief.userInfo(pid, secondUserAddress)).amount)} reward debt ${Number((await this.masterChief.userInfo(pid, secondUserAddress)).rewardDebt)}`);
        // console.log(`sushi provided user3: ${Number((await this.masterChief.userInfo(pid, thirdUserAddress)).amount)} reward debt ${Number((await this.masterChief.userInfo(pid, thirdUserAddress)).rewardDebt)}`);

        await this.masterChief.harvest(pid, userAddress, { from: userAddress });

        await this.masterChief.harvest(pid, secondUserAddress, { from: secondUserAddress });

        await this.masterChief.harvest(pid, thirdUserAddress, { from: thirdUserAddress });
    });

    it('should be able to assert poolLength', async function() {
        expect(Number(await this.masterChief.poolLength())).to.be.equal(1);
    });
  });
});

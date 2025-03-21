import { ethers } from 'ethers';

export type Env = {
  contracts: NamedContracts;
  contractAddresses: NamedAddresses;
};

export interface TestCoordinator {
  loadEnvironment(): Promise<Env>;
}

export function namedContractsToNamedAddresses(contracts: NamedContracts): NamedAddresses {
  const namedAddresses: NamedAddresses = {};

  Object.keys(contracts).map(function (contractName) {
    namedAddresses[contractName] = contracts[contractName].address;
  });

  return namedAddresses;
}

export type Dependency = {
  fips: { [key: string]: boolean };
  contractDependencies: string[];
  externalDependencies: string[];
};
export type DependencyMap = { [key: string]: Dependency };

export type ProposalConfig = {
  deploy: boolean;
  skipDAO: boolean;
  totalValue: number;
  proposal: ProposalDescription;
};

export type ProposalsConfigMap = {
  [key: string]: ProposalConfig;
};

export type ProposalDescription = {
  title: string;
  commands: ProposalCommand[];
  description: string;
};

export type ProposalCommand = {
  target: string;
  values: string;
  method: string;
  arguments: any[];
  description: string;
};

export type NamedContracts = { [key: string]: ethers.Contract };
export type NamedAddresses = { [key: string]: string };
export type DeployUpgradeFunc = (
  deployAddress: string,
  address: NamedAddresses,
  logging: boolean
) => Promise<NamedContracts>;
export type SetupUpgradeFunc = (
  addresses: NamedAddresses,
  oldContracts: NamedContracts,
  contracts: NamedContracts,
  logging: boolean
) => Promise<void>;
export type RunUpgradeFunc = (
  addresses: NamedAddresses,
  oldContracts: NamedContracts,
  contracts: NamedContracts,
  logging: boolean
) => Promise<void>;
export type TeardownUpgradeFunc = (
  addresses: NamedAddresses,
  oldContracts: NamedContracts,
  contracts: NamedContracts,
  logging: boolean
) => Promise<void>;
export type ValidateUpgradeFunc = (
  addresses: NamedAddresses,
  oldContracts: NamedContracts,
  contracts: NamedContracts,
  logging: boolean
) => Promise<void>;

export type UpgradeFuncs = {
  deploy: DeployUpgradeFunc;
  setup: SetupUpgradeFunc;
  run: RunUpgradeFunc;
  teardown: TeardownUpgradeFunc;
  validate: ValidateUpgradeFunc;
};

export type Config = {
  version: number;
  deployAddress: string;
  logging: boolean;
};

export interface MainnetContracts {
  [core: string]: ethers.Contract;
  tribe: ethers.Contract;
  fei: ethers.Contract;
  uniswapPCVDeposit: ethers.Contract;
  uniswapPCVController: ethers.Contract;
  bondingCurve: ethers.Contract;
  chainlinkEthUsdOracle: ethers.Contract;
  chainlinkFeiEthOracle: ethers.Contract;
  compositeOracle: ethers.Contract;
  ethReserveStabilizer: ethers.Contract;
  ratioPCVController: ethers.Contract;
  tribeReserveStabilizer: ethers.Contract;
  feiRewardsDistributor: ethers.Contract;
  timelock: ethers.Contract;
  feiEthPair: ethers.Contract;
  rariPool8FeiPCVDeposit: ethers.Contract;
  rariPool8EthPCVDeposit: ethers.Contract;
  compoundEthPCVDeposit: ethers.Contract;
  compoundDaiPCVDeposit: ethers.Contract;
  curveMetapoolDeposit: ethers.Contract;
  curveMetapool: ethers.Contract;
  curve3pool: ethers.Contract;
  curve3crv: ethers.Contract;
  aaveEthPCVDeposit: ethers.Contract;
  aaveRaiPCVDeposit: ethers.Contract;
  stAAVE: ethers.Contract;
  dpiBondingCurve: ethers.Contract;
  daiBondingCurve: ethers.Contract;
  dpi: ethers.Contract;
  dai: ethers.Contract;
  chainlinkDpiUsdOracleWrapper: ethers.Contract;
  dpiUniswapPCVDeposit: ethers.Contract;
  indexCoopFusePoolDpiPCVDeposit: ethers.Contract;
  raiBondingCurve: ethers.Contract;
  rai: ethers.Contract;
  chainlinkRaiEthOracleWrapper: ethers.Contract;
  chainlinkRaiUsdCompositOracle: ethers.Contract;
  reflexerStableAssetFusePoolRaiPCVDeposit: ethers.Contract;
  kashiFeiTribe: ethers.Contract;
  bentoBox: ethers.Contract;
  aaveEthPCVDripController: ethers.Contract;
  governorAlpha: ethers.Contract;
  tribalChief: ethers.Contract;
  stakingTokenWrapper: ethers.Contract;
  feiTribePair: ethers.Contract;
  rariPool8Tribe: ethers.Contract;
  curve3Metapool: ethers.Contract;
  erc20Dripper: ethers.Contract;
  tribalChiefOptimisticTimelock: ethers.Contract;
  staticPcvDepositWrapper: ethers.Contract;
  collateralizationOracle: ethers.Contract;
  collateralizationOracleWrapper: ethers.Contract;
  collateralizationOracleKeeper: ethers.Contract;
  tribeReserveStabilizerAddress: ethers.Contract;
  pcvEquityMinter: ethers.Contract;
  tribeSplitter: ethers.Contract;
  feiTribeLBPSwapper: ethers.Contract;
  aaveLendingPool: ethers.Contract;
  aaveTribeIncentivesController: ethers.Contract;
  optimisticTimelock: ethers.Contract;
  feiDAO: ethers.Contract;
  autoRewardsDistributor: ethers.Contract;
  rewardsDistributorAdmin: ethers.Contract;
}

export interface MainnetContractAddresses {
  core: string;
  tribe: string;
  fei: string;
  uniswapPCVDeposit: string;
  uniswapPCVController: string;
  bondingCurve: string;
  chainlinkEthUsdOracle: string;
  chainlinkFeiEthOracle: string;
  compositeOracle: string;
  compoundDai: string;
  ethReserveStabilizer: string;
  ratioPCVController: string;
  weth: string;
  uniswapRouter: string;
  feiEthPair: string;
  uniswapOracle: string;
  feiRewardsDistributor: string;
  tribeReserveStabilizer: string;
  timelock: string;
  multisig: string;
  governorAlpha: string;
  indexCoopFusePoolDpi: string;
  reflexerStableAssetFusePoolRai: string;
  bentoBox: string;
  masterKashi: string;
  feiTribePair: string;
  rariPool8Tribe: string;
  curve3Metapool: string;
  tribalChiefOptimisticMultisig: string;
  stakingTokenWrapperRari: string;
  rariRewardsDistributorDelegator: string;
}

export type ContractAccessRights = {
  minter: string[];
  burner: string[];
  governor: string[];
  pcvController: string[];
  guardian: string[];
};

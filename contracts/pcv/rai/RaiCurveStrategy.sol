// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "../PCVDeposit.sol";
import "../../Constants.sol";
import "./RaiPaybackStrategyV1.sol";
import "../../external/rai/GebSafeManager.sol";
import "../../external/rai/CurveV1MaxSaviour.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Curve metapool
interface IStableSwap2 {
    function coins(uint256 arg0) external view returns (address);
    function balances(uint256 arg0) external view returns (uint256);
    function add_liquidity(uint256[2] memory amounts, uint256 min_mint_amount) external;
    function remove_liquidity(uint256 _amount, uint256[2] memory min_amounts) external;
    function remove_liquidity_one_coin(uint256 _token_amount, int128 i, uint256 min_amount) external;
    function get_virtual_price() external view returns (uint256);
    function calc_withdraw_one_coin(uint256 _token_amount, int128 i) external view returns (uint256);
}

//collateralizationRatio = (collateral * fsmETHPrice ) / (debt * accumulatedRate * redemptionPrice)  
///Based off of eswak's StableSwapOperator V1.sol
///@author: ypatil12
contract RaiCurveStrategy is PCVDeposit {
    using SafeERC20 for ERC20;

    // ------------------ Properties -------------------------------------------
    uint256 public depositMaxSlippageBasisPoints;

    /// @notice The index of the safe
    uint256 public safeId;  

    /// @notice The StableSwap pool to deposit in
    address public pool;

    /// @notice The RAI SafeManager, LiquidationEngine, and CurveSaviour Addresses
    address public safeManager;
    address public liquidationEngine;
    address public saviour;

    /// @notice The collateral type of the RAI SAFE
    bytes32 public constant collateralType = "eth";

    // TODO: remove min and max ratio threshold & update how value is expressed
    /// @notice the min and max ratios for FEI-to-value in pool (these can be set by governance)
    /// @notice this ratio is expressed as a percentile with 18 decimal precision, ie 0.1e18 = 10%
    // uint256 public minimumRatioThreshold;
    // uint256 public maximumRatioThreshold;
    /// @notice The Target Collaterlaization Ratio for the safe
    /// @notice This value is expressed as a wad/ray
    uint256 public targetCollateralizationRatio;


    // ------------------ Private properties -----------------------------------

    /// some fixed variables to interact with the pool
    uint8 private immutable _feiIndex; // index of FEI in the pool (0 or 1)
    uint8 private immutable _raiIndex; // index of RAI in the pool (0 or 1)
    address private immutable _rai; // address of the RAI token
    address private immutable _fei; // address of the FEI token

    // ------------------ Constructor ------------------------------------------

    /// @notice Curve PCV Deposit constructor
    /// @notice We initialize the SAFE in the constructor and join to not be susceptible to the chain reorg vulnterability
    /// @param _core Fei Core for reference
    /// @param _pool StableSwap to deposit to
    /// @param _depositMaxSlippageBasisPoints max slippage for deposits, in bp
    constructor(
        address _core,
        address _pool,
        uint256 _depositMaxSlippageBasisPoints,
        uint256 _targetCollateralizationRatio,
        address _safeManager,
        address _liquidationEngine,
        address _saviour
    ) CoreRef(_core) {
        _setTargetCollateralizationRatio(_targetCollateralizationRatio);

        // public variables
        pool = _pool;
        depositMaxSlippageBasisPoints = _depositMaxSlippageBasisPoints;
        safeManager = _safeManager;
        liquidationEngine = _liquidationEngine;
        saviour = _saviour;


        // cached private variables
        uint8 _raiIndexTmp = IStableSwap2(pool).coins(0) == address(fei()) ? 1 : 0;
        _raiIndex = _raiIndexTmp;
        _feiIndex = _raiIndexTmp == 0 ? 1 : 0;
        _rai = IStableSwap2(pool).coins(_raiIndexTmp);

        // open SAFE and Join (see vulnerability)
        safeId = GebSafeManager(safeManager).openSAFE(collateralType, address(this));
        

    }

    // ------------------ Governance Methods -----------------------------------

    function unwindSafe() public onlyGovernorOrAdmin {
        _unwindSafe();
    }

    function setTargetCollateralizationRatio(uint256 _targetCollateralizationRatio) public onlyGovernorOrAdmin{
        _setCollateralizationRatio(_targetCollateralizationRatio);
    }

    //TODO: target collateralization ratio must be >= than liquidation ratio of SAFE
    function _setTargetCollateralizationRatio(uint256 _targetCollateralizationRatio) internal {
        //require(...)
        targetCollateralizationRatio = _targetCollateralizationRatio;
    }

    function openSafe() public onlyGovernorOrAdmin {
        safeId = GebSafeManager(safeManager).openSAFE(collateralType, address(this));
    }

    function updateSaviourKeeperInventive(uint256 payoutValue) public onlyGovernorOrAdmin {
        CurveV1MaxSafeSaviour(saviour).updateParameter(minKeeperPayoutValue, payoutValue);
    }








    // ------------------ Methods ----------------------------------------------

    function _unwindSafe() internal{

    }
    
}
# B3TR Tokenomics Documentation - Sarcophagus Protocol

## Overview
B3TR (Better) tokens are environmental impact rewards distributed by the Vebetter DAO to Sarcophagus protocol users. Unlike unlimited supply tokens, B3TR allocations are controlled by DAO governance and vary based on available funding and community voting.

## 🏛️ DAO-Controlled Supply System

### **Allocation Mechanism**
- **DAO Governance**: Vebetter DAO controls all B3TR allocations
- **Voting Process**: Community members vote on allocation amounts
- **Periodic Batches**: Allocations made in periodic batches (quarterly, annually, etc.)
- **Transparent Tracking**: All allocations publicly visible on blockchain

### **Funding Sources**
- **DAO Treasury**: Primary source of B3TR allocations
- **Environmental Projects**: Revenue from carbon offset initiatives
- **Community Contributions**: Voluntary contributions from community members
- **Protocol Fees**: Portion of protocol fees allocated to B3TR rewards

## 📊 Reward Rate System

### **Adjustable Rates**
All B3TR reward rates are **adjustable** based on available funding:

#### **Carbon Offset Rate**
- **Default**: 5% of inheritance value per year of early death
- **Range**: 0.5% to 20% (adjustable by admin)
- **Cap**: Maximum 30 years of carbon offset
- **Example**: Die 10 years early = 50% of inheritance value in B3TR

#### **Legacy Bonus Base Rate**
- **Default**: 3% of inheritance value for living to expectancy
- **Range**: 0.5% to 10% (adjustable by admin)
- **Example**: Live to expectancy = 3% of inheritance value in B3TR

#### **Legacy Bonus Per Year Rate**
- **Default**: +0.5% per year beyond expectancy
- **Range**: 0.1% to 2% (adjustable by admin)
- **Uncapped**: No limit on years beyond expectancy
- **Example**: Live 5 years beyond expectancy = 5.5% of inheritance value in B3TR

### **Rate Adjustment Triggers**

#### **Manual Adjustment**
- **Admin Control**: Protocol admin can adjust rates within defined ranges
- **DAO Governance**: DAO can vote to change rate ranges
- **Market Conditions**: Rates adjusted based on B3TR market value
- **Usage Patterns**: Rates adjusted based on reward distribution patterns

#### **Automatic Adjustment**
- **Usage Threshold**: Rates auto-adjust when 80% of allocation used
- **Reduction Factor**: Rates reduce by 2% per 1% over threshold
- **Minimum Rate**: Rates cannot go below 20% of original values
- **Maximum Rate**: Rates cannot exceed 200% of original values

## 🔄 Funding Management

### **Allocation Tracking**
```solidity
struct AllocationData {
    uint256 totalDaoAllocation;        // Total B3TR allocated by DAO
    uint256 totalRewardsDistributed;   // Total B3TR distributed as rewards
    uint256 remainingFunding;          // Remaining B3TR available
    uint256 usagePercentage;           // Percentage of allocation used
}
```

### **Period Management**
- **Allocation Periods**: Each DAO allocation has a specific period
- **Period Tracking**: Allocations tracked by period for transparency
- **Period Transitions**: Smooth transitions between allocation periods
- **Historical Data**: Complete history of all allocations and distributions

### **Funding Protection**
- **Sufficient Funding Check**: Rewards only distributed if funding available
- **Partial Distribution**: If insufficient funding, rewards reduced to available amount
- **Queue System**: Large rewards may be queued until funding available
- **Emergency Mode**: Special handling during funding shortages

## 🎯 Reward Distribution Logic

### **Carbon Offset Rewards**
```solidity
function calculateCarbonOffset(
    uint256 yearsEarly,
    uint256 inheritanceValue,
    bool hasGrandfathering
) public view returns (uint256 carbonOffset)
```

**Calculation**:
1. **Base Calculation**: `(yearsEarly × carbonOffsetRate × inheritanceValue) / 10000`
2. **Year Cap**: Maximum 30 years of carbon offset
3. **Grandfathering**: 1.5x multiplier if applicable
4. **Funding Check**: Reduced if insufficient funding available

### **Legacy Bonus Rewards**
```solidity
function calculateLegacyBonus(
    uint256 yearsBeyond,
    uint256 inheritanceValue,
    bool hasGrandfathering
) public view returns (uint256 legacyBonus)
```

**Calculation**:
1. **Base Bonus**: `(inheritanceValue × legacyBonusBase) / 10000`
2. **Additional Bonus**: `(yearsBeyond × legacyBonusPerYear × inheritanceValue) / 10000`
3. **Grandfathering**: 1.5x multiplier if applicable
4. **Funding Check**: Reduced if insufficient funding available

## 📈 Rate Adjustment Scenarios

### **Scenario 1: High Usage (80%+ Allocation Used)**
- **Trigger**: Usage reaches 80% of allocation
- **Action**: Automatic rate reduction
- **Reduction**: 2% per 1% over threshold
- **Example**: 90% usage = 20% rate reduction

### **Scenario 2: Low Funding (Insufficient for Full Reward)**
- **Trigger**: Calculated reward exceeds remaining funding
- **Action**: Reward reduced to available funding
- **Protection**: No rewards distributed if no funding available

### **Scenario 3: New Allocation Received**
- **Trigger**: DAO provides new B3TR allocation
- **Action**: Rates may be restored or increased
- **Opportunity**: Higher rewards possible with new funding

### **Scenario 4: Market Conditions**
- **Trigger**: B3TR market value changes significantly
- **Action**: Manual rate adjustment by admin
- **Consideration**: Balance between reward value and funding sustainability

## 🛡️ Governance and Control

### **DAO Roles**
- **VEBETTER_ROLE**: Can allocate B3TR from DAO treasury
- **DEFAULT_ADMIN_ROLE**: Can adjust rates and manage system
- **VAULT_ROLE**: Can distribute rewards to users

### **Rate Adjustment Limits**
- **Carbon Offset Rate**: 0.5% to 20% (50-2000 basis points)
- **Legacy Bonus Base**: 0.5% to 10% (50-1000 basis points)
- **Legacy Bonus Per Year**: 0.1% to 2% (10-200 basis points)

### **Emergency Controls**
- **Pause Function**: Emergency pause of all reward distributions
- **Rate Freeze**: Freeze rates during emergency situations
- **Funding Lock**: Lock funding during system maintenance

## 📊 Monitoring and Analytics

### **Key Metrics**
- **Allocation Usage**: Percentage of DAO allocation used
- **Reward Distribution**: Total B3TR distributed to users
- **Rate Effectiveness**: Impact of rate adjustments on usage
- **User Satisfaction**: User feedback on reward amounts

### **Reporting Functions**
```solidity
function getFundingStatus() external view returns (
    uint256 totalAllocated,
    uint256 totalDistributed,
    uint256 remainingFunding,
    uint256 usagePercentage
)

function hasSufficientFunding(uint256 rewardAmount) public view returns (bool hasFunding)
```

### **Transparency Features**
- **Public Tracking**: All allocations and distributions publicly visible
- **Period Reports**: Detailed reports for each allocation period
- **Rate History**: Complete history of rate adjustments
- **User Claims**: Individual user reward claim history

## 🎯 Strategic Considerations

### **For DAO Members**
- **Allocation Planning**: Balance between reward generosity and sustainability
- **Rate Monitoring**: Track usage patterns to optimize rates
- **Community Feedback**: Consider user feedback when adjusting rates
- **Market Conditions**: Factor in B3TR market value when setting rates

### **For Users**
- **Inheritance Timing**: Consider B3TR rewards when planning inheritance
- **Rate Awareness**: Monitor current rates before making decisions
- **Funding Status**: Check funding availability before expecting rewards
- **Long-term Planning**: Consider rate adjustments in long-term planning

### **For Protocol**
- **Sustainability**: Ensure B3TR rewards don't exceed available funding
- **User Experience**: Balance rate adjustments with user expectations
- **Transparency**: Maintain clear communication about rate changes
- **Governance**: Encourage DAO participation in allocation decisions

## 🔮 Future Considerations

### **Potential Enhancements**
- **Dynamic Rate Formulas**: More sophisticated rate adjustment algorithms
- **User Voting**: Allow users to vote on rate adjustments
- **Cross-Chain Integration**: B3TR rewards across multiple blockchains
- **Environmental Impact Tracking**: Direct correlation between rewards and environmental impact

### **Scalability Planning**
- **Mass Adoption**: Prepare for increased user base and reward demands
- **Funding Diversification**: Multiple sources of B3TR funding
- **Rate Optimization**: Machine learning for optimal rate setting
- **Governance Evolution**: More sophisticated DAO governance mechanisms

This DAO-controlled B3TR system ensures sustainable, community-driven environmental rewards while maintaining transparency and adaptability to changing conditions. 

## OBOL Token Distribution

### OBOL Inheritance Mechanics
**Important**: All OBOL tokens that are distributed to beneficiaries must be explicitly locked in the vault by the user.

### How OBOL Distribution Works:
1. **Earning**: Users earn OBOL tokens through:
   - Initial bonus on deposits (5% of deposit value)
   - Continuous daily rewards (0.1% daily rate)
   - Long-term holder bonuses (0.15% daily rate after 1 year)

2. **Locking for Inheritance**: 
   - Users must call `lockObolTokens()` function to transfer earned OBOL into their vault
   - Only locked OBOL tokens are included in inheritance distribution
   - Users can choose to lock all, some, or none of their earned OBOL

3. **Beneficiary Distribution**:
   - When inheritance is claimed, only the locked OBOL amount is distributed
   - Distribution follows the same percentage allocation as other assets
   - If no OBOL is locked, beneficiaries receive no OBOL tokens

### User Choice and Flexibility
- Users can withdraw earned OBOL to their VeWorld wallet anytime
- Users can lock OBOL tokens in their vault for inheritance
- Users can choose to lock partial amounts
- This gives users full control over their OBOL inheritance planning

### Example Scenario
1. User deposits 1000 VET and earns 50 OBOL as initial bonus
2. User continues earning 1 OBOL per day for 100 days = 100 additional OBOL
3. User has 150 total OBOL earned
4. User can:
   - Lock all 150 OBOL in vault (full inheritance)
   - Lock 100 OBOL in vault (partial inheritance)
   - Lock 0 OBOL in vault (no OBOL inheritance)
   - Withdraw any amount to VeWorld wallet

## B3TR Reward Categories

### 1. Environmental Awareness Rewards
- **Carbon Footprint Reduction**: Rewards for using green blockchain networks
- **Sustainable Practices**: Bonuses for long-term holding and reduced transactions
- **Educational Engagement**: Rewards for participating in environmental initiatives

### 2. Protocol Participation Rewards
- **Vault Creation**: Initial B3TR bonus for creating inheritance vaults
- **Long-term Commitment**: Increased rewards for extended vault durations
- **Community Contribution**: Rewards for protocol improvements and feedback

### 3. Emergency and Special Rewards
- **Disaster Relief**: B3TR distribution during environmental emergencies
- **Innovation Grants**: Funding for environmental technology projects
- **Community Initiatives**: Support for local environmental programs

## Rate Adjustment System

### Automatic Adjustments
The system automatically adjusts reward rates based on:
- **Funding Usage**: If 80% of daily cap is reached, rates decrease by 10%
- **Supply Pressure**: When 90% of reward pool is distributed, rates reduce by 50%
- **Emergency Triggers**: Automatic rate reduction during crisis situations

### Manual DAO Adjustments
The DAO can manually adjust:
- **Daily Caps**: Increase or decrease daily reward limits
- **Rate Multipliers**: Modify reward rates for specific activities
- **Emergency Allocations**: Release additional funds for special circumstances

## Sustainability Features

### Long-term Viability
- **Rate Decay**: Ensures sustainable distribution over decades
- **Funding Limits**: Prevents rapid token exhaustion
- **DAO Oversight**: Community governance prevents abuse

### Environmental Impact Tracking
- **Carbon Offset Integration**: B3TR rewards tied to verified carbon offsets
- **Green Network Usage**: Bonuses for using energy-efficient blockchains
- **Sustainability Metrics**: Tracking of environmental impact per reward

## Integration with Inheritance System

### Inheritance Distribution
- **Equal Treatment**: B3TR tokens are distributed to beneficiaries like other assets
- **Percentage Allocation**: Follows the same beneficiary percentage system
- **Guardian Support**: Minor beneficiaries receive B3TR through guardians

### Grandfathering System
- **Rate Preservation**: Inheritance recipients maintain original B3TR earning rates
- **Legacy Benefits**: Continued access to environmental rewards
- **Community Continuity**: Encourages ongoing environmental engagement

## Economic Model

### Value Proposition
- **Environmental Impact**: Direct connection to sustainability initiatives
- **Long-term Growth**: Designed for decades of sustainable distribution
- **Community Governance**: DAO-controlled ensures community alignment

### Risk Management
- **Supply Limits**: Prevents inflation through controlled distribution
- **Rate Controls**: Automatic and manual adjustments prevent abuse
- **Emergency Reserves**: 10% of supply reserved for crisis situations

## Future Considerations

### Scalability
- **Cross-chain Integration**: Potential expansion to other blockchain networks
- **Partnership Programs**: Integration with environmental organizations
- **Advanced Metrics**: Enhanced environmental impact tracking

### Governance Evolution
- **Community Proposals**: Direct community input on reward allocation
- **Transparency Tools**: Enhanced visibility into DAO decisions
- **Automated Governance**: Smart contract-based decision making 
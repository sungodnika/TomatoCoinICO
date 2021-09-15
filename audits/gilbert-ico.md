https://github.com/sungodnika/TomatoCoinICO

The following is a micro audit of git commit e300b065f34484668dcb1aec7d9e009c60e9f52a

## General Comments

- What's the difference between an owner and creator? Why have both?

## issue-1

**[Code quality]** Redundant event

In TomatoCoinICO.sol:25, the `TomatoCoinCreation` event isn't necessary. For someone to listen to this event, they would need to know the contract address of TomatoCoinICO. If they have that address, then they can also find the tomatoCoin address.

## Nitpicks

- Consider combining `addPrivateInvestor` and `removePrivateInvestor` into one function to save on code size.
- Lines 68-70, 74-76, and 78-80 can be deduplicated to always run after the `if` statement

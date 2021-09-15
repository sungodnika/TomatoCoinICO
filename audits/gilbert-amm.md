https://github.com/sungodnika/TomatoCoinICO/tree/LP

The following is a micro audit of git commit 8f5e8186a8339b1461b66ceb08c2c9fa70c378f7

## issue-1

**[Medium]** Trades break when price is better than expected

In FruitSwap.sol:101 and 124, `expectedAmountOut - actualAmountOut` causes the transaction to revert if actualAmountOut is more than the expected. This prevents users from getting positive trades.

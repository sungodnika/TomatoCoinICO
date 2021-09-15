https://github.com/sungodnika/TomatoCoinICO

The following is a micro audit of git commit 64c51c77da53165ab0191b1cf1f0be624d9cd488 by Alex Sumner

## Low

- issue 1: FruitSwap.sol line 34: constructor does not check for zero address being passed in as token0 address
- issue 2: FruitSwap.sol line 70: removeLiquidity does not check for zero address being passed in as to address
- issue 3: FruitSwap.sol line 88: swapTokenForETH does not check for zero address being passed in as sender address
- issue 4: FruitSwap.sol line 110: swapETHForToken does not check for zero address being passed in as sender address

## Nitpicks

- FruitSwap.sol lines 14, 15: tokenFee and ethFee are not used anywhere and may not be necessary
- FruitSwap.sol line 16: kLast could be calculated from reserveToken and reserveEth rather than stored on chain
- FruitSwap.sol lines 88 to 131: swapTokenForETH and swapETHForToken have a lot of common code that could be in a separate function they both call 
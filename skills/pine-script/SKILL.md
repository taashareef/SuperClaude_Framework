---
name: Pine Script
description: TradingView Pine Script development assistance. Provides syntax guidance, best practices, and code patterns for creating indicators and strategies on TradingView.
---

# Pine Script Skill

## Purpose

Assists with developing custom indicators and trading strategies using TradingView's Pine Script programming language.

**Official Documentation**: https://www.tradingview.com/pine-script-docs/

## When to Use

Use this skill when:
- Creating custom TradingView indicators
- Building automated trading strategies
- Converting indicators between Pine Script versions
- Debugging Pine Script compilation errors
- Optimizing script performance

## Pine Script Overview

Pine Script is a domain-specific language designed for creating custom technical analysis tools on TradingView. It features:

- **Lightweight syntax** similar to JavaScript/Python
- **Real-time chart integration** with live data
- **Built-in technical analysis** functions
- **Backtesting capabilities** for strategies
- **Community sharing** of scripts

## Version Declaration

Always start scripts with a version declaration:

```pinescript
//@version=6
```

**Current versions**:
- **v6** (latest) - Recommended for new scripts
- **v5** - Stable, widely documented
- **v4** - Legacy support
- **v3** - Deprecated

## Script Types

### Indicator

For visual overlays and analysis panels:

```pinescript
//@version=6
indicator("My Indicator", overlay=true)
plot(close, color=color.blue, title="Close")
```

**Parameters**:
- `title` - Display name (required)
- `overlay` - Draw on price chart (true) or separate pane (false)
- `shorttitle` - Abbreviated name for legends
- `precision` - Decimal places for values

### Strategy

For automated trading logic and backtesting:

```pinescript
//@version=6
strategy("My Strategy", overlay=true, initial_capital=10000)

if ta.crossover(ta.sma(close, 14), ta.sma(close, 28))
    strategy.entry("Long", strategy.long)

if ta.crossunder(ta.sma(close, 14), ta.sma(close, 28))
    strategy.close("Long")
```

**Parameters**:
- `initial_capital` - Starting capital for backtests
- `default_qty_type` - Position sizing method
- `commission_type` - Fee calculation method
- `pyramiding` - Max concurrent entries

### Library

For reusable functions (v5+):

```pinescript
//@version=6
library("MyLibrary")

export sma_crossover(int fast, int slow) =>
    ta.crossover(ta.sma(close, fast), ta.sma(close, slow))
```

## Data Types

### Built-in Series

Time-series data available on each bar:

| Variable | Description |
|----------|-------------|
| `open` | Opening price |
| `high` | Highest price |
| `low` | Lowest price |
| `close` | Closing price |
| `volume` | Trading volume |
| `time` | Bar timestamp |
| `bar_index` | Bar number |

### Basic Types

```pinescript
// Integer
int length = 14

// Float
float threshold = 1.5

// Boolean
bool isUptrend = close > open

// String
string label_text = "Signal"

// Color
color bull_color = color.green
color bear_color = color.red
```

### Special Types

```pinescript
// Array
var float[] prices = array.new_float()
array.push(prices, close)

// Matrix (v5+)
var matrix<float> data = matrix.new<float>(3, 3)

// Map (v5+)
var map<string, float> levels = map.new<string, float>()

// Line
line myLine = line.new(bar_index[10], low[10], bar_index, high)

// Label
label myLabel = label.new(bar_index, high, "Signal")

// Box
box myBox = box.new(bar_index[10], high, bar_index, low)

// Table
var table infoTable = table.new(position.top_right, 2, 2)
```

## User Inputs

Create configurable parameters:

```pinescript
// Numeric inputs
length = input.int(14, "Length", minval=1, maxval=100)
mult = input.float(2.0, "Multiplier", step=0.1)

// Boolean
show_signals = input.bool(true, "Show Signals")

// String with options
ma_type = input.string("SMA", "MA Type", options=["SMA", "EMA", "WMA"])

// Color picker
bull_color = input.color(color.green, "Bullish Color")

// Source selection
src = input.source(close, "Source")

// Timeframe
tf = input.timeframe("D", "Timeframe")

// Symbol
sym = input.symbol("BTCUSD", "Symbol")
```

## Technical Analysis Functions

### Moving Averages

```pinescript
// Simple Moving Average
sma_val = ta.sma(close, 20)

// Exponential Moving Average
ema_val = ta.ema(close, 20)

// Weighted Moving Average
wma_val = ta.wma(close, 20)

// Hull Moving Average
hma_val = ta.hma(close, 20)

// Volume Weighted MA
vwma_val = ta.vwma(close, 20)
```

### Oscillators

```pinescript
// RSI
rsi_val = ta.rsi(close, 14)

// MACD
[macd_line, signal_line, hist] = ta.macd(close, 12, 26, 9)

// Stochastic
[k, d] = ta.stoch(close, high, low, 14, 3, 3)

// CCI
cci_val = ta.cci(close, 20)

// MFI
mfi_val = ta.mfi(hlc3, 14)
```

### Volatility

```pinescript
// ATR
atr_val = ta.atr(14)

// Bollinger Bands
[upper, basis, lower] = ta.bb(close, 20, 2.0)

// Standard Deviation
stdev_val = ta.stdev(close, 20)

// True Range
tr_val = ta.tr
```

### Trend Detection

```pinescript
// Supertrend
[supertrend, direction] = ta.supertrend(3.0, 10)

// Pivot Points
pivot_high = ta.pivothigh(high, 5, 5)
pivot_low = ta.pivotlow(low, 5, 5)

// Highest/Lowest
highest_val = ta.highest(high, 20)
lowest_val = ta.lowest(low, 20)
```

### Crossovers

```pinescript
// Crossover (fast crosses above slow)
bull_cross = ta.crossover(fast_ma, slow_ma)

// Crossunder (fast crosses below slow)
bear_cross = ta.crossunder(fast_ma, slow_ma)

// Cross (either direction)
any_cross = ta.cross(fast_ma, slow_ma)
```

## Multi-Timeframe Analysis

Request data from other timeframes or symbols:

```pinescript
// Higher timeframe data
htf_close = request.security(syminfo.tickerid, "D", close)

// Different symbol
btc_close = request.security("BINANCE:BTCUSDT", "", close)

// With gaps handling
htf_data = request.security(syminfo.tickerid, "W", close, gaps=barmerge.gaps_on)

// Lookahead control (avoid future leak)
htf_safe = request.security(syminfo.tickerid, "D", close[1], lookahead=barmerge.lookahead_on)
```

## Plotting

### Basic Plots

```pinescript
// Line plot
plot(close, color=color.blue, linewidth=2, title="Close")

// Area fill
p1 = plot(upper, color=color.green)
p2 = plot(lower, color=color.red)
fill(p1, p2, color=color.new(color.blue, 90))

// Histogram
plot(volume, style=plot.style_histogram, color=color.gray)

// Shapes
plotshape(buy_signal, style=shape.triangleup, location=location.belowbar, 
          color=color.green, size=size.small)

// Characters
plotchar(sell_signal, char='✗', location=location.abovebar, color=color.red)

// Arrows
plotarrow(momentum, colorup=color.green, colordown=color.red)
```

### Candle Colors

```pinescript
// Color bars based on condition
barcolor(close > open ? color.green : color.red)

// Background color
bgcolor(rsi > 70 ? color.new(color.red, 90) : na)
```

### Drawing Objects

```pinescript
// Horizontal line
hline(70, "Overbought", color=color.red, linestyle=hline.style_dashed)

// Trend line
if buy_signal
    line.new(bar_index[10], low[10], bar_index, close, 
             color=color.green, width=2)

// Label
if sell_signal
    label.new(bar_index, high, "SELL", 
              style=label.style_label_down, color=color.red)

// Box
box.new(bar_index[5], high[5], bar_index, low, 
        bgcolor=color.new(color.blue, 90), border_color=color.blue)
```

## Strategy Functions

### Entry and Exit

```pinescript
// Long entry
strategy.entry("Long", strategy.long, qty=1, when=buy_condition)

// Short entry
strategy.entry("Short", strategy.short, qty=1, when=sell_condition)

// Exit position
strategy.close("Long", when=exit_condition)

// Exit all positions
strategy.close_all()

// Cancel pending orders
strategy.cancel("Long")
strategy.cancel_all()
```

### Order Types

```pinescript
// Limit order
strategy.entry("Long", strategy.long, limit=support_level)

// Stop order
strategy.entry("Long", strategy.long, stop=breakout_level)

// Stop-limit order
strategy.entry("Long", strategy.long, stop=trigger, limit=entry)
```

### Risk Management

```pinescript
// Stop loss and take profit
strategy.exit("Exit", "Long", 
              stop=entry_price * 0.98,      // 2% stop loss
              limit=entry_price * 1.06)     // 6% take profit

// Trailing stop
strategy.exit("Trail", "Long", 
              trail_price=close,
              trail_offset=atr * 2)

// Position sizing by risk
risk_pct = 0.02
stop_distance = atr * 2
qty = (strategy.equity * risk_pct) / stop_distance
```

## Alerts

```pinescript
// Simple alert condition
alertcondition(buy_signal, title="Buy Signal", message="Buy at {{close}}")

// Alert with dynamic message
if buy_signal
    alert("Buy " + syminfo.ticker + " at " + str.tostring(close), alert.freq_once_per_bar)

// Alert for strategy
strategy.entry("Long", strategy.long, alert_message="Long entry at {{close}}")
```

## Best Practices

### 1. Performance Optimization

```pinescript
// Use var for persistent variables (calculated once)
var float highest_ever = 0.0
highest_ever := math.max(highest_ever, high)

// Avoid recalculating static values
var int lookback = 20  // Not: int lookback = 20

// Limit request.security calls
// BAD: Multiple calls for same data
htf_open = request.security(sym, tf, open)
htf_close = request.security(sym, tf, close)

// GOOD: Single call with tuple
[htf_open, htf_close] = request.security(sym, tf, [open, close])
```

### 2. Avoiding Repainting

```pinescript
// Historical reference to avoid repaint
confirmed_signal = buy_condition[1]  // Previous bar's value

// Use barstate for real-time handling
if barstate.isconfirmed
    // Only execute on confirmed bars
    
// Proper security call
htf_data = request.security(sym, tf, close[1], lookahead=barmerge.lookahead_on)
```

### 3. Clean Code Structure

```pinescript
//@version=6
indicator("Well Structured Script", overlay=true)

// ============ INPUTS ============
length = input.int(14, "Length")
src = input.source(close, "Source")

// ============ CALCULATIONS ============
ma = ta.sma(src, length)
signal = ta.crossover(close, ma)

// ============ PLOTTING ============
plot(ma, color=color.blue, title="MA")
plotshape(signal, style=shape.triangleup, location=location.belowbar)

// ============ ALERTS ============
alertcondition(signal, "Crossover", "Price crossed above MA")
```

### 4. Error Handling

```pinescript
// Check for na values
safe_value = na(value) ? 0 : value

// Conditional execution
if not na(pivot_high)
    label.new(bar_index - 5, pivot_high, "PH")

// Array bounds checking
if array.size(prices) > 0
    last_price = array.get(prices, array.size(prices) - 1)
```

## Common Patterns

### Moving Average Crossover Strategy

```pinescript
//@version=6
strategy("MA Crossover", overlay=true)

fast_len = input.int(9, "Fast MA")
slow_len = input.int(21, "Slow MA")

fast_ma = ta.ema(close, fast_len)
slow_ma = ta.ema(close, slow_len)

if ta.crossover(fast_ma, slow_ma)
    strategy.entry("Long", strategy.long)
    
if ta.crossunder(fast_ma, slow_ma)
    strategy.close("Long")

plot(fast_ma, color=color.green)
plot(slow_ma, color=color.red)
```

### RSI Divergence Detection

```pinescript
//@version=6
indicator("RSI Divergence", overlay=false)

length = input.int(14, "RSI Length")
rsi = ta.rsi(close, length)

// Find pivots
rsi_ph = ta.pivothigh(rsi, 5, 5)
rsi_pl = ta.pivotlow(rsi, 5, 5)
price_ph = ta.pivothigh(high, 5, 5)
price_pl = ta.pivotlow(low, 5, 5)

// Get previous pivot values using ta.valuewhen
prev_rsi_ph = ta.valuewhen(not na(rsi_ph), rsi_ph, 1)
prev_rsi_pl = ta.valuewhen(not na(rsi_pl), rsi_pl, 1)
prev_price_ph = ta.valuewhen(not na(price_ph), price_ph, 1)
prev_price_pl = ta.valuewhen(not na(price_pl), price_pl, 1)

// Bearish divergence: price higher high, RSI lower high
bearish_div = not na(rsi_ph) and rsi_ph < prev_rsi_ph and high[5] > prev_price_ph

// Bullish divergence: price lower low, RSI higher low  
bullish_div = not na(rsi_pl) and rsi_pl > prev_rsi_pl and low[5] < prev_price_pl

plot(rsi, color=color.purple)
hline(70, color=color.red)
hline(30, color=color.green)

plotshape(bearish_div, style=shape.triangledown, location=location.top, color=color.red)
plotshape(bullish_div, style=shape.triangleup, location=location.bottom, color=color.green)
```

### Support/Resistance Zones

```pinescript
//@version=6
indicator("S/R Zones", overlay=true)

lookback = input.int(20, "Lookback")
zone_width = input.float(0.5, "Zone Width %") / 100

// Find significant levels
resistance = ta.highest(high, lookback)
support = ta.lowest(low, lookback)

// Draw zones
r_upper = resistance * (1 + zone_width)
r_lower = resistance * (1 - zone_width)
s_upper = support * (1 + zone_width)
s_lower = support * (1 - zone_width)

// Plot
p1 = plot(r_upper, color=color.red, display=display.none)
p2 = plot(r_lower, color=color.red, display=display.none)
fill(p1, p2, color=color.new(color.red, 90))

p3 = plot(s_upper, color=color.green, display=display.none)
p4 = plot(s_lower, color=color.green, display=display.none)
fill(p3, p4, color=color.new(color.green, 90))
```

## Debugging Tips

1. **Use `label.new()` to display values** on the chart for debugging
2. **Check `na()` values** - many errors come from unexpected na
3. **Use `barstate.islast`** to limit debug output to latest bar
4. **Enable "Display" menu** in Pine Editor for variable inspection
5. **Test on different timeframes** - logic may behave differently

## Resources

- **Official Documentation**: https://www.tradingview.com/pine-script-docs/
- **Reference Manual**: https://www.tradingview.com/pine-script-reference/
- **Community Scripts**: https://www.tradingview.com/scripts/
- **Pine Script Chat**: TradingView Discord/Reddit communities

## ROI

**Token Savings**: Quick reference for Pine Script syntax and patterns saves context-switching to external documentation.

**Use Case Coverage**: Indicators, strategies, alerts, and multi-timeframe analysis.

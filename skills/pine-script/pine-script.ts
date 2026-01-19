/**
 * Pine Script Skill - TradingView Pine Script Development Assistance
 *
 * Provides syntax guidance, best practices, and code patterns for
 * creating indicators and strategies on TradingView.
 *
 * Official Documentation: https://www.tradingview.com/pine-script-docs/
 *
 * Features:
 * - Script type detection (indicator/strategy/library)
 * - Version compatibility checking
 * - Common pattern suggestions
 * - Best practice validation
 */

export interface PineScriptContext {
  code?: string;
  scriptType?: 'indicator' | 'strategy' | 'library';
  version?: number;
  errors?: string[];
  [key: string]: unknown;
}

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  suggestions: string[];
}

export interface CodeTemplate {
  name: string;
  description: string;
  code: string;
}

/**
 * Pine Script Development Assistant
 *
 * Usage:
 *   const assistant = new PineScriptAssistant();
 *   const validation = assistant.validateScript(code);
 *   const template = assistant.getTemplate('ma_crossover');
 */
export class PineScriptAssistant {
  private readonly CURRENT_VERSION = 6;
  private readonly SUPPORTED_VERSIONS = [3, 4, 5, 6];
  /**
   * Minimum code length threshold for suggesting section comments.
   * Scripts under this length are typically simple enough to not need
   * structured organization with section headers.
   */
  private readonly MIN_LENGTH_FOR_SECTIONS = 500;

  /**
   * Detect Pine Script version from code
   *
   * @param code - Pine Script source code
   * @returns Version number or null if not found
   */
  detectVersion(code: string): number | null {
    const versionMatch = code.match(/\/\/@version=(\d+)/);
    if (versionMatch) {
      return parseInt(versionMatch[1], 10);
    }
    return null;
  }

  /**
   * Detect script type from code
   *
   * @param code - Pine Script source code
   * @returns Script type or null if not detected
   */
  detectScriptType(code: string): 'indicator' | 'strategy' | 'library' | null {
    if (code.includes('indicator(')) {
      return 'indicator';
    }
    if (code.includes('strategy(')) {
      return 'strategy';
    }
    if (code.includes('library(')) {
      return 'library';
    }
    return null;
  }

  /**
   * Validate Pine Script code for common issues
   *
   * @param code - Pine Script source code
   * @returns Validation result with warnings and suggestions
   */
  validateScript(code: string): ValidationResult {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check version declaration
    const version = this.detectVersion(code);
    if (!version) {
      warnings.push('Missing version declaration. Add //@version=6 at the top.');
    } else if (version < this.CURRENT_VERSION) {
      suggestions.push(
        `Consider upgrading to Pine Script v${this.CURRENT_VERSION} for latest features.`
      );
    }

    // Check script type declaration
    const scriptType = this.detectScriptType(code);
    if (!scriptType) {
      warnings.push(
        'Missing script type declaration. Add indicator(), strategy(), or library().'
      );
    }

    // Check for potential repainting issues
    if (this.hasRepaintingRisk(code)) {
      warnings.push(
        'Potential repainting detected. Use confirmed bar data or historical references.'
      );
    }

    // Check for performance issues
    const perfIssues = this.checkPerformance(code);
    warnings.push(...perfIssues);

    // Check for best practices
    const bestPractices = this.checkBestPractices(code);
    suggestions.push(...bestPractices);

    return {
      valid: warnings.length === 0,
      warnings,
      suggestions,
    };
  }

  /**
   * Check for potential repainting issues
   */
  private hasRepaintingRisk(code: string): boolean {
    // Check for request.security without proper lookahead handling
    if (
      code.includes('request.security') &&
      !code.includes('lookahead') &&
      !code.includes('[1]')
    ) {
      return true;
    }

    // Check for using real-time data in strategy entries without confirmation
    // These patterns detect common cases where current bar data affects signals
    const hasStrategyEntry =
      /strategy\.entry\s*\([^)]*(?:close|open|high|low)(?!\[)/.test(code);
    const hasUnconfirmedCondition =
      /if\s+(?:close|open|high|low)\s*[><=!]+\s*[^[\n]*(?:strategy\.|alert)/.test(
        code
      );

    const hasConfirmation =
      code.includes('barstate.isconfirmed') ||
      /\[1\]/.test(code) ||
      code.includes('barstate.islastconfirmedhistory');

    return (hasStrategyEntry || hasUnconfirmedCondition) && !hasConfirmation;
  }

  /**
   * Check for performance issues
   */
  private checkPerformance(code: string): string[] {
    const issues: string[] = [];

    // Check for multiple request.security calls that could be combined
    const securityCalls = (code.match(/request\.security/g) || []).length;
    if (securityCalls > 3) {
      issues.push(
        `Found ${securityCalls} request.security calls. Consider combining with tuple returns.`
      );
    }

    // Check for var keyword usage with basic and complex types
    const hasStaticVars =
      /var\s+(?:int|float|bool|string|array<|matrix<|map<)/.test(code);
    const hasLoops = /for\s+/.test(code) || /while\s+/.test(code);
    if (hasLoops && !hasStaticVars) {
      issues.push(
        'Consider using var for persistent variables to improve performance.'
      );
    }

    return issues;
  }

  /**
   * Check for best practices
   */
  private checkBestPractices(code: string): string[] {
    const suggestions: string[] = [];

    // Suggest input validation
    if (code.includes('input.int') && !code.includes('minval')) {
      suggestions.push('Consider adding minval/maxval constraints to int inputs.');
    }

    // Suggest alert conditions
    if (
      this.detectScriptType(code) === 'indicator' &&
      !code.includes('alertcondition') &&
      !code.includes('alert(')
    ) {
      suggestions.push('Consider adding alertcondition() for signal notifications.');
    }

    // Suggest strategy risk management
    if (
      this.detectScriptType(code) === 'strategy' &&
      !code.includes('strategy.exit')
    ) {
      suggestions.push(
        'Consider adding strategy.exit() for stop loss and take profit management.'
      );
    }

    // Suggest code organization for longer scripts
    if (code.length > this.MIN_LENGTH_FOR_SECTIONS && !code.includes('// ===')) {
      suggestions.push(
        'Consider adding section comments (// === INPUTS ===) for better organization.'
      );
    }

    return suggestions;
  }

  /**
   * Get a code template by name
   *
   * @param templateName - Name of the template
   * @returns Code template or null if not found
   */
  getTemplate(templateName: string): CodeTemplate | null {
    const templates: Record<string, CodeTemplate> = {
      indicator_basic: {
        name: 'Basic Indicator',
        description: 'Simple indicator template with inputs and plotting',
        code: `//@version=6
indicator("My Indicator", overlay=true)

// ============ INPUTS ============
length = input.int(14, "Length", minval=1, maxval=100)
src = input.source(close, "Source")

// ============ CALCULATIONS ============
ma = ta.sma(src, length)
signal = ta.crossover(close, ma)

// ============ PLOTTING ============
plot(ma, color=color.blue, linewidth=2, title="MA")
plotshape(signal, style=shape.triangleup, location=location.belowbar,
    color=color.green, size=size.small, title="Signal")

// ============ ALERTS ============
alertcondition(signal, "Crossover", "Price crossed above MA")
`,
      },
      strategy_basic: {
        name: 'Basic Strategy',
        description: 'Simple strategy template with entry, exit, and risk management',
        code: `//@version=6
strategy("My Strategy", overlay=true, initial_capital=10000,
         default_qty_type=strategy.percent_of_equity, default_qty_value=100)

// ============ INPUTS ============
fast_len = input.int(9, "Fast MA Length", minval=1)
slow_len = input.int(21, "Slow MA Length", minval=1)
stop_pct = input.float(2.0, "Stop Loss %", minval=0.1, step=0.1) / 100
take_pct = input.float(4.0, "Take Profit %", minval=0.1, step=0.1) / 100

// ============ CALCULATIONS ============
fast_ma = ta.ema(close, fast_len)
slow_ma = ta.ema(close, slow_len)

buy_signal = ta.crossover(fast_ma, slow_ma)
sell_signal = ta.crossunder(fast_ma, slow_ma)

// ============ STRATEGY LOGIC ============
if buy_signal
    strategy.entry("Long", strategy.long)

if sell_signal
    strategy.close("Long")

// Risk management
if strategy.position_size > 0
    entry_price = strategy.position_avg_price
    strategy.exit("Exit", "Long",
        stop=entry_price * (1 - stop_pct),
        limit=entry_price * (1 + take_pct))

// ============ PLOTTING ============
plot(fast_ma, color=color.green, title="Fast MA")
plot(slow_ma, color=color.red, title="Slow MA")
`,
      },
      ma_crossover: {
        name: 'Moving Average Crossover',
        description: 'Classic dual moving average crossover strategy',
        code: `//@version=6
strategy("MA Crossover Strategy", overlay=true)

// Inputs
fast_len = input.int(9, "Fast MA")
slow_len = input.int(21, "Slow MA")
ma_type = input.string("EMA", "MA Type", options=["SMA", "EMA", "WMA"])

// Calculate MAs
fast_ma = switch ma_type
    "SMA" => ta.sma(close, fast_len)
    "EMA" => ta.ema(close, fast_len)
    "WMA" => ta.wma(close, fast_len)

slow_ma = switch ma_type
    "SMA" => ta.sma(close, slow_len)
    "EMA" => ta.ema(close, slow_len)
    "WMA" => ta.wma(close, slow_len)

// Signals
long_signal = ta.crossover(fast_ma, slow_ma)
short_signal = ta.crossunder(fast_ma, slow_ma)

// Strategy
if long_signal
    strategy.entry("Long", strategy.long)
if short_signal
    strategy.close("Long")

// Plot
plot(fast_ma, color=color.green, title="Fast")
plot(slow_ma, color=color.red, title="Slow")
plotshape(long_signal, style=shape.triangleup, location=location.belowbar, color=color.green)
plotshape(short_signal, style=shape.triangledown, location=location.abovebar, color=color.red)
`,
      },
      rsi_divergence: {
        name: 'RSI Divergence',
        description: 'RSI indicator with divergence detection',
        code: `//@version=6
indicator("RSI Divergence", overlay=false)

// Inputs
length = input.int(14, "RSI Length", minval=1)
overbought = input.int(70, "Overbought", minval=50, maxval=100)
oversold = input.int(30, "Oversold", minval=0, maxval=50)
pivot_lookback = input.int(5, "Pivot Lookback", minval=1)

// RSI
rsi = ta.rsi(close, length)

// Pivot detection
rsi_ph = ta.pivothigh(rsi, pivot_lookback, pivot_lookback)
rsi_pl = ta.pivotlow(rsi, pivot_lookback, pivot_lookback)
price_ph = ta.pivothigh(high, pivot_lookback, pivot_lookback)
price_pl = ta.pivotlow(low, pivot_lookback, pivot_lookback)

// Divergence detection
bearish_div = not na(rsi_ph) and not na(price_ph) and
              rsi_ph < ta.valuewhen(not na(rsi_ph), rsi_ph, 1) and
              price_ph > ta.valuewhen(not na(price_ph), price_ph, 1)

bullish_div = not na(rsi_pl) and not na(price_pl) and
              rsi_pl > ta.valuewhen(not na(rsi_pl), rsi_pl, 1) and
              price_pl < ta.valuewhen(not na(price_pl), price_pl, 1)

// Plot
plot(rsi, color=color.purple, title="RSI")
hline(overbought, "Overbought", color=color.red, linestyle=hline.style_dashed)
hline(oversold, "Oversold", color=color.green, linestyle=hline.style_dashed)
hline(50, "Middle", color=color.gray, linestyle=hline.style_dotted)

bgcolor(rsi > overbought ? color.new(color.red, 90) : na)
bgcolor(rsi < oversold ? color.new(color.green, 90) : na)

plotshape(bearish_div, style=shape.triangledown, location=location.top,
          color=color.red, size=size.small, title="Bearish Div")
plotshape(bullish_div, style=shape.triangleup, location=location.bottom,
          color=color.green, size=size.small, title="Bullish Div")

// Alerts
alertcondition(bearish_div, "Bearish Divergence", "RSI bearish divergence detected")
alertcondition(bullish_div, "Bullish Divergence", "RSI bullish divergence detected")
`,
      },
      bollinger_bands: {
        name: 'Bollinger Bands Strategy',
        description: 'Bollinger Bands with squeeze detection',
        code: `//@version=6
indicator("Bollinger Bands Squeeze", overlay=true)

// Inputs
length = input.int(20, "BB Length", minval=1)
mult = input.float(2.0, "BB Multiplier", minval=0.1, step=0.1)
kc_length = input.int(20, "KC Length", minval=1)
kc_mult = input.float(1.5, "KC Multiplier", minval=0.1, step=0.1)

// Bollinger Bands
[bb_upper, bb_basis, bb_lower] = ta.bb(close, length, mult)

// Keltner Channel for squeeze
atr_val = ta.atr(kc_length)
kc_upper = bb_basis + kc_mult * atr_val
kc_lower = bb_basis - kc_mult * atr_val

// Squeeze detection
squeeze_on = bb_lower > kc_lower and bb_upper < kc_upper
squeeze_off = bb_lower < kc_lower and bb_upper > kc_upper

// Plot
plot(bb_upper, color=color.blue, title="BB Upper")
plot(bb_basis, color=color.orange, title="BB Basis")
plot(bb_lower, color=color.blue, title="BB Lower")

p1 = plot(bb_upper, display=display.none)
p2 = plot(bb_lower, display=display.none)
fill(p1, p2, color=squeeze_on ? color.new(color.red, 80) : color.new(color.blue, 90))

// Squeeze indicator
plotshape(squeeze_on and not squeeze_on[1], style=shape.diamond,
          location=location.bottom, color=color.red, size=size.tiny, title="Squeeze On")
plotshape(squeeze_off and not squeeze_off[1], style=shape.diamond,
          location=location.bottom, color=color.green, size=size.tiny, title="Squeeze Off")
`,
      },
      support_resistance: {
        name: 'Support/Resistance Zones',
        description: 'Dynamic support and resistance zone detection',
        code: `//@version=6
indicator("Support/Resistance Zones", overlay=true)

// Inputs
lookback = input.int(20, "Lookback Period", minval=5)
zone_pct = input.float(0.5, "Zone Width %", minval=0.1, step=0.1) / 100
show_labels = input.bool(true, "Show Labels")

// Find levels
resistance = ta.highest(high, lookback)
support = ta.lowest(low, lookback)

// Zone boundaries
r_upper = resistance * (1 + zone_pct)
r_lower = resistance * (1 - zone_pct)
s_upper = support * (1 + zone_pct)
s_lower = support * (1 - zone_pct)

// Near zone detection
near_resistance = close >= r_lower and close <= r_upper
near_support = close >= s_lower and close <= s_upper

// Plot zones
p1 = plot(r_upper, color=color.new(color.red, 100))
p2 = plot(r_lower, color=color.new(color.red, 100))
fill(p1, p2, color=color.new(color.red, 85), title="Resistance Zone")

p3 = plot(s_upper, color=color.new(color.green, 100))
p4 = plot(s_lower, color=color.new(color.green, 100))
fill(p3, p4, color=color.new(color.green, 85), title="Support Zone")

// Labels
if show_labels and barstate.islast
    label.new(bar_index + 5, resistance, "R: " + str.tostring(resistance, format.mintick),
              style=label.style_label_left, color=color.red, textcolor=color.white)
    label.new(bar_index + 5, support, "S: " + str.tostring(support, format.mintick),
              style=label.style_label_left, color=color.green, textcolor=color.white)

// Background highlight
bgcolor(near_resistance ? color.new(color.red, 95) : na)
bgcolor(near_support ? color.new(color.green, 95) : na)

// Alerts
alertcondition(near_resistance, "Near Resistance", "Price approaching resistance zone")
alertcondition(near_support, "Near Support", "Price approaching support zone")
`,
      },
    };

    return templates[templateName] || null;
  }

  /**
   * Get all available template names
   */
  getTemplateNames(): string[] {
    return [
      'indicator_basic',
      'strategy_basic',
      'ma_crossover',
      'rsi_divergence',
      'bollinger_bands',
      'support_resistance',
    ];
  }

  /**
   * Generate a recommended action based on context
   *
   * @param context - Pine Script context
   * @returns Recommended action string
   */
  getRecommendation(context: PineScriptContext): string {
    if (!context.code) {
      return '📝 Start with a template using getTemplate() method';
    }

    const validation = this.validateScript(context.code);

    if (validation.warnings.length > 0) {
      return `⚠️ Address ${validation.warnings.length} warning(s): ${validation.warnings[0]}`;
    }

    if (validation.suggestions.length > 0) {
      return `💡 Consider: ${validation.suggestions[0]}`;
    }

    return '✅ Script looks good! Test on TradingView chart.';
  }
}

/**
 * Legacy function-based API for backward compatibility
 */
export function validatePineScript(code: string): ValidationResult {
  const assistant = new PineScriptAssistant();
  return assistant.validateScript(code);
}

export function getPineScriptTemplate(name: string): CodeTemplate | null {
  const assistant = new PineScriptAssistant();
  return assistant.getTemplate(name);
}

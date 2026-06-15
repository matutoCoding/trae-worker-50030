import type {
  FootMeasurement,
  LastDimensions,
  FitDeviation,
  RiskWarning,
  LastFitResult,
  GradingRule,
  GradingResult,
  LeatherType,
  LeatherSimResult,
  UpperPattern,
  ShoeStyle
} from '@/types/shoe';

export function calculateLastDimensions(foot: FootMeasurement): LastDimensions {
  const lengthAllowance = foot.shoeStyle === 'boot' ? 15 : foot.shoeStyle === 'loafer' ? 10 : 12;
  const girthAllowance = foot.shoeStyle === 'boot' ? 10 : foot.shoeStyle === 'loafer' ? 7 : 9;
  const instepAllowance = foot.shoeStyle === 'boot' ? 12 : foot.shoeStyle === 'loafer' ? 6 : 8;

  const toeShapeWidthAdj = foot.toeShape === 'square' ? 4 : foot.toeShape === 'greek' ? -1 : 0;
  const archInstepAdj = foot.archType === 'high' ? 4 : foot.archType === 'flat' ? -2 : 0;

  const lastLength = foot.footLength + lengthAllowance;
  const lastBallGirth = foot.ballGirth + girthAllowance;
  const lastInstepGirth = foot.instepHeight * 2 + foot.ballGirth * 0.5 + instepAllowance + archInstepAdj;
  const lastHeelGirth = foot.heelWidth * 3.3;
  const lastWidth = lastBallGirth * 0.38 + toeShapeWidthAdj;

  const baseToeSpring = foot.shoeStyle === 'loafer' ? 12 : foot.shoeStyle === 'boot' ? 20 : 18;
  const baseHeelSpring = foot.shoeStyle === 'boot' ? 35 : foot.shoeStyle === 'loafer' ? 18 : 25;

  const archToeAdj = foot.archType === 'high' ? 3 : foot.archType === 'flat' ? -2 : 0;
  const archHeelAdj = foot.archType === 'high' ? 2 : foot.archType === 'flat' ? -3 : 0;

  const toeSpring = baseToeSpring + archToeAdj;
  const heelSpring = baseHeelSpring + archHeelAdj;

  const shoeSize = footLengthToSize(foot.footLength, foot.gender);

  return {
    lastLength: Math.round(lastLength),
    lastBallGirth: Math.round(lastBallGirth),
    lastInstepGirth: Math.round(lastInstepGirth),
    lastHeelGirth: Math.round(lastHeelGirth),
    lastWidth: Math.round(lastWidth),
    toeSpring: Math.round(toeSpring),
    heelSpring: Math.round(heelSpring),
    shoeSize
  };
}

export function footLengthToSize(length: number, gender: 'male' | 'female'): number {
  const base = gender === 'male' ? 255 : 235;
  const size = Math.round((length - base) / 5) + (gender === 'male' ? 40 : 36);
  return Math.max(gender === 'male' ? 38 : 34, Math.min(gender === 'male' ? 46 : 42, size));
}

export function sizeToFootLength(size: number, gender: 'male' | 'female'): number {
  const base = gender === 'male' ? 255 : 235;
  return base + (size - (gender === 'male' ? 40 : 36)) * 5;
}

export function analyzeFitDeviations(foot: FootMeasurement, last: LastDimensions): FitDeviation[] {
  const deviations: FitDeviation[] = [];

  const lengthDiff = last.lastLength - foot.footLength;
  const lengthStatus = lengthDiff < 8 ? 'tight' : lengthDiff > 18 ? 'loose' : 'good';
  const lengthSeverity = lengthDiff < 5 ? 'high' : lengthDiff < 8 ? 'medium' : lengthDiff > 22 ? 'medium' : lengthDiff > 18 ? 'low' : 'none';
  deviations.push({
    dimension: '楦底长放量',
    deviation: lengthDiff,
    status: lengthStatus,
    severity: lengthStatus === 'good' ? 'none' : lengthSeverity,
    description: lengthDiff < 8 ? '长度偏短，可能顶脚' : lengthDiff > 18 ? '长度偏长，可能不跟脚' : '长度适配良好'
  });

  const girthDiff = last.lastBallGirth - foot.ballGirth;
  const girthStatus = girthDiff < 5 ? 'tight' : girthDiff > 15 ? 'loose' : 'good';
  const girthSeverity = girthDiff < 3 ? 'high' : girthDiff < 5 ? 'medium' : girthDiff > 18 ? 'medium' : girthDiff > 15 ? 'low' : 'none';
  deviations.push({
    dimension: '跖围放量',
    deviation: girthDiff,
    status: girthStatus,
    severity: girthStatus === 'good' ? 'none' : girthSeverity,
    description: girthDiff < 5 ? '跖围偏紧，可能夹脚' : girthDiff > 15 ? '跖围偏松，可能松垮' : '跖围适配良好'
  });

  const instepDiff = last.lastInstepGirth - (foot.instepHeight * 2 + foot.ballGirth * 0.5);
  const instepStatus = instepDiff < 4 ? 'tight' : instepDiff > 14 ? 'loose' : 'good';
  deviations.push({
    dimension: '背围放量',
    deviation: Math.round(instepDiff),
    status: instepStatus,
    severity: instepStatus === 'good' ? 'none' : instepDiff < 2 ? 'high' : 'low',
    description: instepDiff < 4 ? '脚背偏紧，可能压脚背' : instepDiff > 14 ? '脚背偏松，包裹性差' : '脚背适配良好'
  });

  const widthDiff = last.lastWidth - (foot.ballGirth * 0.38);
  const widthStatus = widthDiff < -1 ? 'tight' : widthDiff > 4 ? 'loose' : 'good';
  deviations.push({
    dimension: '楦宽偏差',
    deviation: Math.round(widthDiff),
    status: widthStatus,
    severity: widthStatus === 'good' ? 'none' : Math.abs(widthDiff) > 5 ? 'medium' : 'low',
    description: widthDiff < -1 ? '楦宽偏窄，可能挤脚' : widthDiff > 4 ? '楦宽偏宽，可能松垮' : '楦宽适配良好'
  });

  return deviations;
}

export function generateRiskWarnings(foot: FootMeasurement, last: LastDimensions, deviations: FitDeviation[]): RiskWarning[] {
  const warnings: RiskWarning[] = [];

  const girthDev = deviations.find(d => d.dimension === '跖围放量');
  if (girthDev && girthDev.status === 'tight') {
    warnings.push({
      type: 'tight',
      location: '前掌',
      severity: girthDev.severity === 'high' ? 'high' : 'medium',
      description: girthDev.severity === 'high' ? '跖围严重不足，夹脚风险极高' : '跖围偏紧，有夹脚风险',
      suggestion: `建议跖围增加${Math.max(0, 8 - girthDev.deviation)}mm`
    });
  }

  const lengthDev = deviations.find(d => d.dimension === '楦底长放量');
  if (lengthDev && lengthDev.status === 'tight') {
    warnings.push({
      type: 'pressure',
      location: '脚趾',
      severity: lengthDev.severity === 'high' ? 'high' : 'medium',
      description: lengthDev.severity === 'high' ? '长度严重不足，顶脚风险极高' : '长度偏短，有顶脚风险',
      suggestion: `建议楦长增加${Math.max(0, 10 - lengthDev.deviation)}mm`
    });
  }

  const instepDev = deviations.find(d => d.dimension === '背围放量');
  if (instepDev && instepDev.status === 'tight') {
    warnings.push({
      type: 'pressure',
      location: '脚背',
      severity: instepDev.severity === 'high' ? 'high' : 'low',
      description: '脚背偏紧，长时间穿着可能压迫脚背',
      suggestion: '建议增加背围放量或选择开口较深的鞋款'
    });
  }

  if (last.heelSpring > 38) {
    warnings.push({
      type: 'rubbing',
      location: '后跟',
      severity: 'medium',
      description: '后跷偏高，后跟易磨脚',
      suggestion: '建议降低后跷2-4mm或加软垫'
    });
  }

  if (last.toeSpring > 28) {
    warnings.push({
      type: 'pressure',
      location: '前掌',
      severity: 'low',
      description: '前跷偏高，前掌压力集中',
      suggestion: '建议降低前跷2-3mm'
    });
  }

  if (foot.archType === 'high' && foot.shoeStyle === 'loafer') {
    warnings.push({
      type: 'pressure',
      location: '脚背',
      severity: 'medium',
      description: '高足弓穿乐福鞋，脚背易受压',
      suggestion: '建议选择德比或牛津款式'
    });
  }

  if (girthDev && girthDev.status === 'loose' && girthDev.severity !== 'none') {
    warnings.push({
      type: 'loose',
      location: '整体',
      severity: girthDev.severity === 'medium' ? 'medium' : 'low',
      description: '楦型偏宽松垮，行走时可能不跟脚',
      suggestion: `建议跖围减少${Math.max(0, girthDev.deviation - 12)}mm`
    });
  }

  return warnings;
}

export function calculateOverallFit(deviations: FitDeviation[], warnings: RiskWarning[]): 'excellent' | 'good' | 'acceptable' | 'poor' {
  const hasHigh = warnings.some(w => w.severity === 'high');
  const hasMedium = warnings.some(w => w.severity === 'medium');
  const goodCount = deviations.filter(d => d.status === 'good').length;

  if (hasHigh) return 'poor';
  if (hasMedium && goodCount < 2) return 'acceptable';
  if (hasMedium) return 'good';
  if (goodCount === deviations.length) return 'excellent';
  return 'good';
}

export function performLastFit(foot: FootMeasurement): LastFitResult {
  const lastDimensions = calculateLastDimensions(foot);
  const deviations = analyzeFitDeviations(foot, lastDimensions);
  const riskWarnings = generateRiskWarnings(foot, lastDimensions, deviations);
  const overallFit = calculateOverallFit(deviations, riskWarnings);

  return { lastDimensions, deviations, overallFit, riskWarnings };
}

export function calculateGrading(
  baseLast: LastDimensions,
  baseSize: number,
  gender: 'male' | 'female'
): GradingResult {
  const lengthInc = 5;
  const girthInc = gender === 'male' ? 4 : 3.5;
  const widthInc = 1.5;

  const sizeRange = gender === 'male'
    ? [38, 39, 40, 41, 42, 43, 44, 45, 46]
    : [34, 35, 36, 37, 38, 39, 40];

  const rules: GradingRule[] = sizeRange.map((size) => {
    const diff = size - baseSize;
    return {
      size,
      lastLength: Math.round(baseLast.lastLength + diff * lengthInc),
      lastBallGirth: Math.round(baseLast.lastBallGirth + diff * girthInc),
      lastInstepGirth: Math.round(baseLast.lastInstepGirth + diff * girthInc),
      lastWidth: Math.round((baseLast.lastWidth + diff * widthInc) * 10) / 10,
      toeSpring: Math.round(baseLast.toeSpring + diff * 0.3),
      heelSpring: Math.round(baseLast.heelSpring + diff * 0.4)
    };
  });

  return {
    baseSize,
    lengthIncrement: lengthInc,
    girthIncrement: girthInc,
    widthIncrement: widthInc,
    rules
  };
}

export const LEATHER_TYPES: LeatherType[] = [
  { name: '小牛皮', stretchPercent: 4, thickness: 1.2, description: '柔软细腻，延展性好' },
  { name: '牛皮', stretchPercent: 2.5, thickness: 1.5, description: '坚韧耐磨，延展性中等' },
  { name: '羊皮', stretchPercent: 6, thickness: 0.8, description: '极度柔软，延展性极佳' },
  { name: '马臀皮', stretchPercent: 1.5, thickness: 1.8, description: '致密紧实，延展性低' },
  { name: '翻毛皮', stretchPercent: 3.5, thickness: 1.4, description: '柔软有弹性，延展性中等' }
];

export function simulateLeatherStretch(
  last: LastDimensions,
  leather: LeatherType
): LeatherSimResult {
  const stretchFactor = leather.stretchPercent / 100;
  const effectiveBallGirth = Math.round(last.lastBallGirth * (1 + stretchFactor));
  const effectiveInstepGirth = Math.round(last.lastInstepGirth * (1 + stretchFactor));
  const ballGrowth = last.lastBallGirth * stretchFactor;
  const instepGrowth = last.lastInstepGirth * stretchFactor;

  let fitChange: string;
  let comfortLevel: 'excellent' | 'good' | 'acceptable' | 'poor';

  if (leather.stretchPercent >= 5) {
    fitChange = `延展较大，跖围约增大${ballGrowth.toFixed(1)}mm，穿着后逐渐变松`;
    comfortLevel = 'good';
  } else if (leather.stretchPercent >= 3) {
    fitChange = `延展适中，跖围约增大${ballGrowth.toFixed(1)}mm，穿着后微松`;
    comfortLevel = 'excellent';
  } else if (leather.stretchPercent >= 2) {
    fitChange = `延展较小，跖围约增大${ballGrowth.toFixed(1)}mm，尺寸稳定`;
    comfortLevel = 'good';
  } else {
    fitChange = `延展极小，跖围约增大${ballGrowth.toFixed(1)}mm，需精确匹配`;
    comfortLevel = 'acceptable';
  }

  return {
    leatherName: leather.name,
    stretchPercent: leather.stretchPercent,
    effectiveBallGirth,
    effectiveInstepGirth,
    fitChange,
    comfortLevel
  };
}

export function validateSpring(toeSpring: number, heelSpring: number, style: ShoeStyle): {
  toeOk: boolean;
  heelOk: boolean;
  toeWarning: string;
  heelWarning: string;
} {
  const toeRange: Record<ShoeStyle, [number, number]> = {
    oxford: [14, 24],
    derby: [14, 22],
    loafer: [10, 18],
    boot: [16, 26],
    monk: [14, 22],
    chelsea: [18, 28]
  };
  const heelRange: Record<ShoeStyle, [number, number]> = {
    oxford: [20, 30],
    derby: [18, 28],
    loafer: [14, 22],
    boot: [28, 38],
    monk: [20, 28],
    chelsea: [25, 35]
  };

  const [tMin, tMax] = toeRange[style];
  const [hMin, hMax] = heelRange[style];

  const toeOk = toeSpring >= tMin && toeSpring <= tMax;
  const heelOk = heelSpring >= hMin && heelSpring <= hMax;

  return {
    toeOk,
    heelOk,
    toeWarning: !toeOk
      ? toeSpring < tMin
        ? `前跷${toeSpring}mm偏低（建议${tMin}-${tMax}mm），行走不畅`
        : `前跷${toeSpring}mm偏高（建议${tMin}-${tMax}mm），前掌压力集中`
      : `前跷${toeSpring}mm在合理范围内`,
    heelWarning: !heelOk
      ? heelSpring < hMin
        ? `后跷${heelSpring}mm偏低（建议${hMin}-${hMax}mm），后跟不稳`
        : `后跷${heelSpring}mm偏高（建议${hMin}-${hMax}mm），易磨后跟`
      : `后跷${heelSpring}mm在合理范围内`
  };
}

export function generateUpperPattern(last: LastDimensions, style: ShoeStyle): UpperPattern {
  const vampLength = Math.round(last.lastLength * 0.55);
  const vampWidth = Math.round(last.lastBallGirth * 0.52);
  const quarterLength = Math.round(last.lastLength * 0.6);
  const quarterWidth = Math.round(last.lastBallGirth * 0.48);
  const toeCapLength = Math.round(last.lastLength * 0.28);
  const toeCapWidth = Math.round(last.lastWidth * 1.15);
  const tongueLength = Math.round(last.lastLength * 0.35);
  const tongueWidth = Math.round(last.lastWidth * 0.8);

  if (style === 'loafer') {
    return {
      vampLength,
      vampWidth: Math.round(vampWidth * 1.05),
      quarterLength: Math.round(quarterLength * 0.7),
      quarterWidth,
      toeCapLength: 0,
      toeCapWidth: 0,
      tongueLength: 0,
      tongueWidth: 0,
      lastLength: last.lastLength,
      lastBallGirth: last.lastBallGirth
    };
  }

  return {
    vampLength,
    vampWidth,
    quarterLength,
    quarterWidth,
    toeCapLength,
    toeCapWidth,
    tongueLength,
    tongueWidth,
    lastLength: last.lastLength,
    lastBallGirth: last.lastBallGirth
  };
}

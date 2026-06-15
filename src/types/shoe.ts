export interface FootMeasurement {
  id: string;
  customerName: string;
  footLength: number;
  ballGirth: number;
  instepHeight: number;
  heelWidth: number;
  toeShape: ToeShape;
  archType: ArchType;
  footSide: 'left' | 'right' | 'both';
  shoeStyle: ShoeStyle;
  gender: 'male' | 'female';
  notes: string;
  createdAt: string;
}

export type ToeShape = 'egyptian' | 'greek' | 'square';

export type ArchType = 'normal' | 'high' | 'flat';

export type ShoeStyle = 'oxford' | 'derby' | 'loafer' | 'boot' | 'monk' | 'chelsea';

export interface LastDimensions {
  lastLength: number;
  lastBallGirth: number;
  lastInstepGirth: number;
  lastHeelGirth: number;
  lastWidth: number;
  toeSpring: number;
  heelSpring: number;
  shoeSize: number;
}

export interface FitDeviation {
  dimension: string;
  deviation: number;
  status: 'good' | 'tight' | 'loose';
  severity: 'none' | 'low' | 'medium' | 'high';
  description: string;
}

export interface LastFitResult {
  lastDimensions: LastDimensions;
  deviations: FitDeviation[];
  overallFit: 'excellent' | 'good' | 'acceptable' | 'poor';
  riskWarnings: RiskWarning[];
}

export interface RiskWarning {
  type: 'tight' | 'loose' | 'pressure' | 'rubbing';
  location: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

export interface GradingRule {
  size: number;
  lastLength: number;
  lastBallGirth: number;
  lastInstepGirth: number;
  lastWidth: number;
  toeSpring: number;
  heelSpring: number;
}

export interface GradingResult {
  baseSize: number;
  lengthIncrement: number;
  girthIncrement: number;
  widthIncrement: number;
  rules: GradingRule[];
}

export interface LeatherType {
  name: string;
  stretchPercent: number;
  thickness: number;
  description: string;
}

export interface LeatherSimResult {
  leatherName: string;
  stretchPercent: number;
  effectiveBallGirth: number;
  effectiveInstepGirth: number;
  fitChange: string;
  comfortLevel: 'excellent' | 'good' | 'acceptable' | 'poor';
}

export interface UpperPattern {
  vampLength: number;
  vampWidth: number;
  quarterLength: number;
  quarterWidth: number;
  toeCapLength: number;
  toeCapWidth: number;
  tongueLength: number;
  tongueWidth: number;
  lastLength: number;
  lastBallGirth: number;
}

export interface CustomerArchive {
  id: string;
  customerName: string;
  phone: string;
  footMeasurements: FootMeasurement[];
  lastFitResults: LastFitResult[];
  riskWarnings: RiskWarning[];
  createdAt: string;
  updatedAt: string;
}

export interface PatternLibrary {
  id: string;
  name: string;
  description: string;
  footType: string;
  shoeStyle: ShoeStyle;
  gender: 'male' | 'female';
  footMeasurement: FootMeasurement;
  lastDimensions: LastDimensions;
  deviations: FitDeviation[];
  createdAt: string;
  usageCount: number;
}

export const TOE_SHAPE_LABELS: Record<ToeShape, string> = {
  egyptian: '埃及脚',
  greek: '希腊脚',
  square: '方形脚'
};

export const ARCH_TYPE_LABELS: Record<ArchType, string> = {
  normal: '正常足弓',
  high: '高足弓',
  flat: '扁平足'
};

export const SHOE_STYLE_LABELS: Record<ShoeStyle, string> = {
  oxford: '牛津鞋',
  derby: '德比鞋',
  loafer: '乐福鞋',
  boot: '靴子',
  monk: '僧侣鞋',
  chelsea: '切尔西靴'
};

export const GENDER_LABELS = {
  male: '男',
  female: '女'
};

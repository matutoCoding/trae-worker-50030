import type {
  FootMeasurement,
  LastFitResult,
  CustomerArchive,
  PatternLibrary,
  RiskWarning
} from '@/types/shoe';

interface ShoeStore {
  currentFoot: FootMeasurement | null;
  currentFitResult: LastFitResult | null;
  archives: CustomerArchive[];
  patternLibrary: PatternLibrary[];
  setCurrentFoot: (foot: FootMeasurement) => void;
  setCurrentFitResult: (result: LastFitResult) => void;
  addArchive: (archive: CustomerArchive) => void;
  updateArchive: (id: string, archive: Partial<CustomerArchive>) => void;
  deleteArchive: (id: string) => void;
  addToLibrary: (pattern: PatternLibrary) => void;
  removeFromLibrary: (id: string) => void;
  incrementUsage: (id: string) => void;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const defaultArchives: CustomerArchive[] = [
  {
    id: generateId(),
    customerName: '张先生',
    phone: '138****6789',
    footMeasurements: [
      {
        id: generateId(),
        customerName: '张先生',
        footLength: 265,
        ballGirth: 248,
        instepHeight: 72,
        heelWidth: 62,
        toeShape: 'egyptian',
        archType: 'normal',
        footSide: 'both',
        shoeStyle: 'oxford',
        gender: 'male',
        notes: '标准脚型',
        createdAt: '2025-12-15'
      }
    ],
    lastFitResults: [],
    riskWarnings: [
      {
        type: 'rubbing',
        location: '后跟',
        severity: 'low',
        description: '轻微后跟磨脚风险',
        suggestion: '建议后跟增加软垫'
      }
    ],
    createdAt: '2025-12-15',
    updatedAt: '2025-12-20'
  },
  {
    id: generateId(),
    customerName: '李女士',
    phone: '139****4321',
    footMeasurements: [
      {
        id: generateId(),
        customerName: '李女士',
        footLength: 240,
        ballGirth: 225,
        instepHeight: 65,
        heelWidth: 55,
        toeShape: 'greek',
        archType: 'high',
        footSide: 'both',
        shoeStyle: 'loafer',
        gender: 'female',
        notes: '高足弓，需注意脚背压迫',
        createdAt: '2025-12-18'
      }
    ],
    lastFitResults: [],
    riskWarnings: [],
    createdAt: '2025-12-18',
    updatedAt: '2025-12-18'
  },
  {
    id: generateId(),
    customerName: '王先生',
    phone: '136****8765',
    footMeasurements: [
      {
        id: generateId(),
        customerName: '王先生',
        footLength: 275,
        ballGirth: 260,
        instepHeight: 78,
        heelWidth: 68,
        toeShape: 'square',
        archType: 'flat',
        footSide: 'both',
        shoeStyle: 'derby',
        gender: 'male',
        notes: '宽脚扁平足，需加宽楦型',
        createdAt: '2025-12-20'
      }
    ],
    lastFitResults: [],
    riskWarnings: [
      {
        type: 'tight',
        location: '前掌',
        severity: 'medium',
        description: '跖围偏紧，可能夹脚',
        suggestion: '建议跖围放量增加2mm'
      }
    ],
    createdAt: '2025-12-20',
    updatedAt: '2025-12-22'
  }
];

const defaultLibrary: PatternLibrary[] = [
  {
    id: generateId(),
    name: '标准男鞋牛津楦',
    description: '适合埃及脚型标准男脚，跖围放量10mm',
    footType: '埃及脚·正常足弓',
    shoeStyle: 'oxford',
    gender: 'male',
    footMeasurement: {
      id: 'tpl1',
      customerName: '模板',
      footLength: 265,
      ballGirth: 245,
      instepHeight: 70,
      heelWidth: 60,
      toeShape: 'egyptian',
      archType: 'normal',
      footSide: 'both',
      shoeStyle: 'oxford',
      gender: 'male',
      notes: '',
      createdAt: '2025-01-01'
    },
    lastDimensions: {
      lastLength: 275,
      lastBallGirth: 255,
      lastInstepGirth: 260,
      lastHeelGirth: 210,
      lastWidth: 98,
      toeSpring: 18,
      heelSpring: 25,
      shoeSize: 42
    },
    deviations: [],
    createdAt: '2025-01-01',
    usageCount: 56
  },
  {
    id: generateId(),
    name: '宽脚德比楦',
    description: '适合方形脚宽脚型，跖围放量12mm',
    footType: '方形脚·扁平足',
    shoeStyle: 'derby',
    gender: 'male',
    footMeasurement: {
      id: 'tpl2',
      customerName: '模板',
      footLength: 270,
      ballGirth: 258,
      instepHeight: 75,
      heelWidth: 66,
      toeShape: 'square',
      archType: 'flat',
      footSide: 'both',
      shoeStyle: 'derby',
      gender: 'male',
      notes: '',
      createdAt: '2025-01-01'
    },
    lastDimensions: {
      lastLength: 280,
      lastBallGirth: 270,
      lastInstepGirth: 272,
      lastHeelGirth: 218,
      lastWidth: 104,
      toeSpring: 16,
      heelSpring: 22,
      shoeSize: 43
    },
    deviations: [],
    createdAt: '2025-01-15',
    usageCount: 34
  },
  {
    id: generateId(),
    name: '高足弓乐福楦',
    description: '适合高足弓希腊脚型，脚背放量充足',
    footType: '希腊脚·高足弓',
    shoeStyle: 'loafer',
    gender: 'female',
    footMeasurement: {
      id: 'tpl3',
      customerName: '模板',
      footLength: 240,
      ballGirth: 225,
      instepHeight: 68,
      heelWidth: 54,
      toeShape: 'greek',
      archType: 'high',
      footSide: 'both',
      shoeStyle: 'loafer',
      gender: 'female',
      notes: '',
      createdAt: '2025-02-01'
    },
    lastDimensions: {
      lastLength: 250,
      lastBallGirth: 235,
      lastInstepGirth: 242,
      lastHeelGirth: 195,
      lastWidth: 88,
      toeSpring: 15,
      heelSpring: 20,
      shoeSize: 37
    },
    deviations: [],
    createdAt: '2025-02-01',
    usageCount: 28
  },
  {
    id: generateId(),
    name: '窄脚切尔西靴楦',
    description: '适合窄脚型切尔西靴，跟脚包裹性好',
    footType: '埃及脚·正常足弓',
    shoeStyle: 'chelsea',
    gender: 'male',
    footMeasurement: {
      id: 'tpl4',
      customerName: '模板',
      footLength: 260,
      ballGirth: 238,
      instepHeight: 68,
      heelWidth: 58,
      toeShape: 'egyptian',
      archType: 'normal',
      footSide: 'both',
      shoeStyle: 'chelsea',
      gender: 'male',
      notes: '',
      createdAt: '2025-03-01'
    },
    lastDimensions: {
      lastLength: 270,
      lastBallGirth: 248,
      lastInstepGirth: 252,
      lastHeelGirth: 205,
      lastWidth: 92,
      toeSpring: 20,
      heelSpring: 30,
      shoeSize: 41
    },
    deviations: [],
    createdAt: '2025-03-01',
    usageCount: 19
  }
];

export { generateId };

import { create } from 'zustand';

const savedArchives = defaultArchives;
const savedLibrary = defaultLibrary;

export const useShoeStore = create<ShoeStore>((set) => ({
  currentFoot: null,
  currentFitResult: null,
  archives: savedArchives,
  patternLibrary: savedLibrary,
  setCurrentFoot: (foot) => set({ currentFoot: foot }),
  setCurrentFitResult: (result) => set({ currentFitResult: result }),
  addArchive: (archive) =>
    set((state) => ({ archives: [...state.archives, archive] })),
  updateArchive: (id, updates) =>
    set((state) => ({
      archives: state.archives.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : a
      )
    })),
  deleteArchive: (id) =>
    set((state) => ({
      archives: state.archives.filter((a) => a.id !== id)
    })),
  addToLibrary: (pattern) =>
    set((state) => ({ patternLibrary: [...state.patternLibrary, pattern] })),
  removeFromLibrary: (id) =>
    set((state) => ({
      patternLibrary: state.patternLibrary.filter((p) => p.id !== id)
    })),
  incrementUsage: (id) =>
    set((state) => ({
      patternLibrary: state.patternLibrary.map((p) =>
        p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p
      )
    }))
}));

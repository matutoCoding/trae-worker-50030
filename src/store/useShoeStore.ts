import Taro from '@tarojs/taro';
import { create } from 'zustand';
import type {
  FootMeasurement,
  LastFitResult,
  CustomerArchive,
  PatternLibrary
} from '@/types/shoe';

const STORAGE_KEY_ARCHIVES = 'shoe_archives';
const STORAGE_KEY_LIBRARY = 'shoe_pattern_library';
const STORAGE_KEY_CURRENT_FOOT = 'shoe_current_foot';
const STORAGE_KEY_CURRENT_FIT = 'shoe_current_fit';
const STORAGE_KEY_RECENT_FOOTS = 'shoe_recent_foots';
const STORAGE_KEY_INIT_FLAG = 'shoe_data_initialized';

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const getTodayStr = () => new Date().toISOString().split('T')[0];

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

async function loadFromStorage<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const res = await Taro.getStorage({ key });
    if (res.data) {
      return res.data as T;
    }
  } catch (e) {
    console.warn('[Storage] 读取失败', key, e);
  }
  return defaultValue;
}

async function saveToStorage<T>(key: string, value: T): Promise<void> {
  try {
    await Taro.setStorage({ key, data: value });
  } catch (e) {
    console.error('[Storage] 写入失败', key, e);
  }
}

interface ShoeStore {
  currentFoot: FootMeasurement | null;
  currentFitResult: LastFitResult | null;
  archives: CustomerArchive[];
  patternLibrary: PatternLibrary[];
  recentFoots: FootMeasurement[];
  initialized: boolean;
  initStorage: () => Promise<void>;
  setCurrentFoot: (foot: FootMeasurement) => void;
  setCurrentFitResult: (result: LastFitResult) => void;
  addRecentFoot: (foot: FootMeasurement) => void;
  addArchive: (archive: CustomerArchive) => void;
  saveOrUpdateArchive: (foot: FootMeasurement, fitResult: LastFitResult) => CustomerArchive;
  updateArchive: (id: string, archive: Partial<CustomerArchive>) => void;
  deleteArchive: (id: string) => void;
  addToLibrary: (pattern: PatternLibrary) => void;
  removeFromLibrary: (id: string) => void;
  incrementUsage: (id: string) => void;
  applyPattern: (pattern: PatternLibrary) => void;
}

export const useShoeStore = create<ShoeStore>((set, get) => ({
  currentFoot: null,
  currentFitResult: null,
  archives: defaultArchives,
  patternLibrary: defaultLibrary,
  recentFoots: [],
  initialized: false,

  initStorage: async () => {
    if (get().initialized) return;

    console.info('[Storage] 初始化数据...');

    const initFlag = await loadFromStorage<boolean>(STORAGE_KEY_INIT_FLAG, false);

    let archives: CustomerArchive[];
    let library: PatternLibrary[];

    if (initFlag) {
      archives = await loadFromStorage<CustomerArchive[]>(STORAGE_KEY_ARCHIVES, defaultArchives);
      library = await loadFromStorage<PatternLibrary[]>(STORAGE_KEY_LIBRARY, defaultLibrary);
    } else {
      archives = defaultArchives;
      library = defaultLibrary;
      await saveToStorage(STORAGE_KEY_ARCHIVES, archives);
      await saveToStorage(STORAGE_KEY_LIBRARY, library);
      await saveToStorage(STORAGE_KEY_INIT_FLAG, true);
      console.info('[Storage] 首次初始化，写入默认数据');
    }

    const currentFoot = await loadFromStorage<FootMeasurement | null>(STORAGE_KEY_CURRENT_FOOT, null);
    const currentFitResult = await loadFromStorage<LastFitResult | null>(STORAGE_KEY_CURRENT_FIT, null);
    const recentFoots = await loadFromStorage<FootMeasurement[]>(STORAGE_KEY_RECENT_FOOTS, []);

    set({
      archives,
      patternLibrary: library,
      currentFoot,
      currentFitResult,
      recentFoots,
      initialized: true
    });

    console.info('[Storage] 数据加载完成', {
      archives: archives.length,
      library: library.length,
      recentFoots: recentFoots.length,
      hasCurrentFoot: !!currentFoot
    });
  },

  setCurrentFoot: (foot) => {
    set({ currentFoot: foot });
    saveToStorage(STORAGE_KEY_CURRENT_FOOT, foot);
  },

  setCurrentFitResult: (result) => {
    set({ currentFitResult: result });
    saveToStorage(STORAGE_KEY_CURRENT_FIT, result);
  },

  addRecentFoot: (foot) => {
    const current = get().recentFoots.filter(f => f.id !== foot.id);
    const updated = [foot, ...current].slice(0, 10);
    set({ recentFoots: updated });
    saveToStorage(STORAGE_KEY_RECENT_FOOTS, updated);
  },

  addArchive: (archive) => {
    const updated = [...get().archives, archive];
    set({ archives: updated });
    saveToStorage(STORAGE_KEY_ARCHIVES, updated);
  },

  saveOrUpdateArchive: (foot, fitResult) => {
    const { archives } = get();
    const existingIndex = archives.findIndex(
      a => a.customerName === foot.customerName
    );

    if (existingIndex >= 0) {
      const existing = archives[existingIndex];
      const updatedArchive: CustomerArchive = {
        ...existing,
        footMeasurements: [foot, ...existing.footMeasurements.filter(f => f.id !== foot.id)],
        lastFitResults: [fitResult, ...existing.lastFitResults.slice(0, 4)],
        riskWarnings: fitResult.riskWarnings.length > 0
          ? [...fitResult.riskWarnings, ...existing.riskWarnings.slice(0, 3)]
          : existing.riskWarnings,
        updatedAt: getTodayStr()
      };
      const updated = [...archives];
      updated[existingIndex] = updatedArchive;
      set({ archives: updated });
      saveToStorage(STORAGE_KEY_ARCHIVES, updated);
      console.info('[Archive] 已追加到已有档案:', foot.customerName);
      return updatedArchive;
    } else {
      const newArchive: CustomerArchive = {
        id: generateId(),
        customerName: foot.customerName,
        phone: '',
        footMeasurements: [foot],
        lastFitResults: [fitResult],
        riskWarnings: fitResult.riskWarnings,
        createdAt: getTodayStr(),
        updatedAt: getTodayStr()
      };
      const updated = [newArchive, ...archives];
      set({ archives: updated });
      saveToStorage(STORAGE_KEY_ARCHIVES, updated);
      console.info('[Archive] 已创建新档案:', foot.customerName);
      return newArchive;
    }
  },

  updateArchive: (id, updates) => {
    const updated = get().archives.map(a =>
      a.id === id ? { ...a, ...updates, updatedAt: getTodayStr() } : a
    );
    set({ archives: updated });
    saveToStorage(STORAGE_KEY_ARCHIVES, updated);
  },

  deleteArchive: (id) => {
    const updated = get().archives.filter(a => a.id !== id);
    set({ archives: updated });
    saveToStorage(STORAGE_KEY_ARCHIVES, updated);
  },

  addToLibrary: (pattern) => {
    const updated = [pattern, ...get().patternLibrary];
    set({ patternLibrary: updated });
    saveToStorage(STORAGE_KEY_LIBRARY, updated);
  },

  removeFromLibrary: (id) => {
    const updated = get().patternLibrary.filter(p => p.id !== id);
    set({ patternLibrary: updated });
    saveToStorage(STORAGE_KEY_LIBRARY, updated);
  },

  incrementUsage: (id) => {
    const updated = get().patternLibrary.map(p =>
      p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p
    );
    set({ patternLibrary: updated });
    saveToStorage(STORAGE_KEY_LIBRARY, updated);
  },

  applyPattern: (pattern) => {
    const foot: FootMeasurement = {
      ...pattern.footMeasurement,
      id: generateId(),
      createdAt: getTodayStr()
    };

    const deviations = pattern.deviations && pattern.deviations.length > 0
      ? pattern.deviations
      : [
          { dimension: '楦底长放量', deviation: pattern.lastDimensions.lastLength - pattern.footMeasurement.footLength, status: 'good', severity: 'none', description: '长度适配良好' },
          { dimension: '跖围放量', deviation: pattern.lastDimensions.lastBallGirth - pattern.footMeasurement.ballGirth, status: 'good', severity: 'none', description: '跖围适配良好' },
          { dimension: '背围放量', deviation: 8, status: 'good', severity: 'none', description: '脚背适配良好' },
          { dimension: '楦宽偏差', deviation: 2, status: 'good', severity: 'none', description: '楦宽适配良好' }
        ];

    const fitResult: LastFitResult = {
      lastDimensions: pattern.lastDimensions,
      deviations,
      overallFit: 'excellent',
      riskWarnings: []
    };

    get().incrementUsage(pattern.id);
    get().setCurrentFoot(foot);
    get().setCurrentFitResult(fitResult);
    get().addRecentFoot(foot);

    console.info('[Pattern] 版型已应用:', pattern.name);
  }
}));

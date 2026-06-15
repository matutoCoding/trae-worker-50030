import React, { useState } from 'react';
import { View, Text, Input, Textarea, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useShoeStore, generateId } from '@/store/useShoeStore';
import type { FootMeasurement, ToeShape, ArchType, ShoeStyle } from '@/types/shoe';
import { TOE_SHAPE_LABELS, ARCH_TYPE_LABELS, SHOE_STYLE_LABELS, GENDER_LABELS } from '@/types/shoe';
import styles from './index.module.scss';

const TOE_OPTIONS: ToeShape[] = ['egyptian', 'greek', 'square'];
const ARCH_OPTIONS: ArchType[] = ['normal', 'high', 'flat'];
const STYLE_OPTIONS: ShoeStyle[] = ['oxford', 'derby', 'loafer', 'boot', 'monk', 'chelsea'];
const GENDER_OPTIONS: ('male' | 'female')[] = ['male', 'female'];

const FootEntryPage: React.FC = () => {
  const { recentFoots, setCurrentFoot, addRecentFoot, currentFoot } = useShoeStore();

  const [customerName, setCustomerName] = useState(currentFoot?.customerName || '');
  const [footLength, setFootLength] = useState(currentFoot ? String(currentFoot.footLength) : '');
  const [ballGirth, setBallGirth] = useState(currentFoot ? String(currentFoot.ballGirth) : '');
  const [instepHeight, setInstepHeight] = useState(currentFoot ? String(currentFoot.instepHeight) : '');
  const [heelWidth, setHeelWidth] = useState(currentFoot ? String(currentFoot.heelWidth) : '');
  const [toeShape, setToeShape] = useState<ToeShape>(currentFoot?.toeShape || 'egyptian');
  const [archType, setArchType] = useState<ArchType>(currentFoot?.archType || 'normal');
  const [shoeStyle, setShoeStyle] = useState<ShoeStyle>(currentFoot?.shoeStyle || 'oxford');
  const [gender, setGender] = useState<'male' | 'female'>(currentFoot?.gender || 'male');
  const [notes, setNotes] = useState(currentFoot?.notes || '');

  const handleSubmit = () => {
    if (!customerName.trim()) {
      Taro.showToast({ title: '请输入客户姓名', icon: 'none' });
      return;
    }
    if (!footLength || parseFloat(footLength) < 200 || parseFloat(footLength) > 320) {
      Taro.showToast({ title: '请输入有效脚长(200-320mm)', icon: 'none' });
      return;
    }
    if (!ballGirth || parseFloat(ballGirth) < 180 || parseFloat(ballGirth) > 320) {
      Taro.showToast({ title: '请输入有效跖围(180-320mm)', icon: 'none' });
      return;
    }
    if (!instepHeight || parseFloat(instepHeight) < 40 || parseFloat(instepHeight) > 120) {
      Taro.showToast({ title: '请输入有效脚背高度(40-120mm)', icon: 'none' });
      return;
    }

    const footData: FootMeasurement = {
      id: generateId(),
      customerName: customerName.trim(),
      footLength: parseFloat(footLength),
      ballGirth: parseFloat(ballGirth),
      instepHeight: parseFloat(instepHeight),
      heelWidth: heelWidth ? parseFloat(heelWidth) : 60,
      toeShape,
      archType,
      footSide: 'both',
      shoeStyle,
      gender,
      notes,
      createdAt: new Date().toISOString().split('T')[0]
    };

    console.info('[FootEntry] 保存脚型数据:', footData);
    setCurrentFoot(footData, true);
    addRecentFoot(footData);
    Taro.showToast({ title: '录入成功', icon: 'success' });
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/lastFit/index' });
    }, 1000);
  };

  const handleReset = () => {
    setCustomerName('');
    setFootLength('');
    setBallGirth('');
    setInstepHeight('');
    setHeelWidth('');
    setToeShape('egyptian');
    setArchType('normal');
    setShoeStyle('oxford');
    setGender('male');
    setNotes('');
  };

  const handleLoadHistory = (foot: FootMeasurement) => {
    setCustomerName(foot.customerName);
    setFootLength(String(foot.footLength));
    setBallGirth(String(foot.ballGirth));
    setInstepHeight(String(foot.instepHeight));
    setHeelWidth(String(foot.heelWidth));
    setToeShape(foot.toeShape);
    setArchType(foot.archType);
    setShoeStyle(foot.shoeStyle);
    setGender(foot.gender);
    setNotes(foot.notes);
    Taro.showToast({ title: '已加载历史数据', icon: 'success' });
  };

  const displayRecentFoots = recentFoots.slice(0, 5);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>脚型数据录入</Text>
        <Text className={styles.headerDesc}>录入客户脚型数据，为楦型适配提供精准依据</Text>
      </View>

      {displayRecentFoots.length > 0 && (
        <View className={styles.historySection}>
          <Text className={styles.cardTitle}>最近录入</Text>
          {displayRecentFoots.map((foot) => (
            <View
              key={foot.id}
              className={styles.historyCard}
              onClick={() => handleLoadHistory(foot)}
            >
              <View className={styles.historyInfo}>
                <Text className={styles.historyName}>{foot.customerName}</Text>
                <Text className={styles.historyMeta}>
                  脚长{foot.footLength}mm · 跖围{foot.ballGirth}mm · {SHOE_STYLE_LABELS[foot.shoeStyle]}
                </Text>
              </View>
              <Text className={styles.historyArrow}>加载 ›</Text>
            </View>
          ))}
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>基本信息</Text>
          <View className={styles.inputGroup}>
            <Text className={styles.inputLabel}>
              <Text className={styles.inputLabelRequired}>*</Text>客户姓名
            </Text>
            <View className={styles.inputWrapper}>
              <Input
                className={styles.inputField}
                placeholder='请输入客户姓名'
                value={customerName}
                onInput={(e) => setCustomerName(e.detail.value)}
              />
            </View>
          </View>
          <View className={styles.selectorGroup}>
            <Text className={styles.selectorLabel}>性别</Text>
            <View className={styles.selectorRow}>
              {GENDER_OPTIONS.map((g) => (
                <View
                  key={g}
                  className={classnames(styles.selectorItem, gender === g && styles.selectorItemActive)}
                  onClick={() => setGender(g)}
                >
                  <Text>{GENDER_LABELS[g]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>脚型尺寸</Text>
          <View className={styles.inputGroup}>
            <Text className={styles.inputLabel}>
              <Text className={styles.inputLabelRequired}>*</Text>脚长
              <Text className={styles.inputLabelUnit}>(最长脚趾到脚跟)</Text>
            </Text>
            <View className={styles.inputWrapper}>
              <Input
                className={styles.inputField}
                type='digit'
                placeholder='如 265'
                value={footLength}
                onInput={(e) => setFootLength(e.detail.value)}
              />
              <Text className={styles.inputUnit}>mm</Text>
            </View>
            <Text className={styles.measureHint}>站立位测量，脚均匀承重，量最长脚趾端到足跟最后端</Text>
          </View>
          <View className={styles.inputGroup}>
            <Text className={styles.inputLabel}>
              <Text className={styles.inputLabelRequired}>*</Text>跖围
              <Text className={styles.inputLabelUnit}>(前脚掌围度)</Text>
            </Text>
            <View className={styles.inputWrapper}>
              <Input
                className={styles.inputField}
                type='digit'
                placeholder='如 248'
                value={ballGirth}
                onInput={(e) => setBallGirth(e.detail.value)}
              />
              <Text className={styles.inputUnit}>mm</Text>
            </View>
            <Text className={styles.measureHint}>软尺绕第一至第五跖趾关节最突点一圈</Text>
          </View>
          <View className={styles.inputGroup}>
            <Text className={styles.inputLabel}>
              <Text className={styles.inputLabelRequired}>*</Text>脚背高度
              <Text className={styles.inputLabelUnit}>(脚背最高点到鞋底)</Text>
            </Text>
            <View className={styles.inputWrapper}>
              <Input
                className={styles.inputField}
                type='digit'
                placeholder='如 72'
                value={instepHeight}
                onInput={(e) => setInstepHeight(e.detail.value)}
              />
              <Text className={styles.inputUnit}>mm</Text>
            </View>
          </View>
          <View className={styles.inputGroup}>
            <Text className={styles.inputLabel}>
              脚跟宽度
              <Text className={styles.inputLabelUnit}>(选填)</Text>
            </Text>
            <View className={styles.inputWrapper}>
              <Input
                className={styles.inputField}
                type='digit'
                placeholder='如 62'
                value={heelWidth}
                onInput={(e) => setHeelWidth(e.detail.value)}
              />
              <Text className={styles.inputUnit}>mm</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>脚型特征</Text>
          <View className={styles.selectorGroup}>
            <Text className={styles.selectorLabel}>趾型</Text>
            <View className={styles.selectorRow}>
              {TOE_OPTIONS.map((t) => (
                <View
                  key={t}
                  className={classnames(styles.selectorItem, toeShape === t && styles.selectorItemActive)}
                  onClick={() => setToeShape(t)}
                >
                  <Text>{TOE_SHAPE_LABELS[t]}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.selectorGroup}>
            <Text className={styles.selectorLabel}>足弓</Text>
            <View className={styles.selectorRow}>
              {ARCH_OPTIONS.map((a) => (
                <View
                  key={a}
                  className={classnames(styles.selectorItem, archType === a && styles.selectorItemActive)}
                  onClick={() => setArchType(a)}
                >
                  <Text>{ARCH_TYPE_LABELS[a]}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.selectorGroup}>
            <Text className={styles.selectorLabel}>目标鞋款</Text>
            <View className={styles.selectorRow}>
              {STYLE_OPTIONS.map((s) => (
                <View
                  key={s}
                  className={classnames(styles.selectorItem, shoeStyle === s && styles.selectorItemActive)}
                  onClick={() => setShoeStyle(s)}
                >
                  <Text>{SHOE_STYLE_LABELS[s]}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>备注</Text>
          <Textarea
            className={styles.notesArea}
            placeholder='特殊脚型特征或客户需求...'
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={styles.btnSecondary} onClick={handleReset}>
          重置
        </Button>
        <Button className={styles.btnPrimary} onClick={handleSubmit}>
          提交并适配楦型
        </Button>
      </View>
    </ScrollView>
  );
};

export default FootEntryPage;

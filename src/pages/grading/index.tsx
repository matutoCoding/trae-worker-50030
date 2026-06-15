import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useShoeStore } from '@/store/useShoeStore';
import {
  calculateGrading,
  LEATHER_TYPES,
  simulateLeatherStretch,
  validateSpring,
  generateUpperPattern
} from '@/utils/shoeCalculations';
import styles from './index.module.scss';

const COMFORT_LABELS: Record<string, string> = {
  excellent: '极佳',
  good: '良好',
  acceptable: '一般',
  poor: '偏差'
};

const GradingPage: React.FC = () => {
  const { currentFoot, currentFitResult } = useShoeStore();
  const [selectedLeather, setSelectedLeather] = useState(0);

  const gradingResult = useMemo(() => {
    if (!currentFitResult || !currentFoot) return null;
    return calculateGrading(
      currentFitResult.lastDimensions,
      currentFitResult.lastDimensions.shoeSize,
      currentFoot.gender
    );
  }, [currentFitResult, currentFoot]);

  const springValidation = useMemo(() => {
    if (!currentFitResult || !currentFoot) return null;
    const { toeSpring, heelSpring } = currentFitResult.lastDimensions;
    return validateSpring(toeSpring, heelSpring, currentFoot.shoeStyle);
  }, [currentFitResult, currentFoot]);

  const leatherSim = useMemo(() => {
    if (!currentFitResult) return null;
    return simulateLeatherStretch(
      currentFitResult.lastDimensions,
      LEATHER_TYPES[selectedLeather]
    );
  }, [currentFitResult, selectedLeather]);

  const upperPattern = useMemo(() => {
    if (!currentFitResult || !currentFoot) return null;
    return generateUpperPattern(currentFitResult.lastDimensions, currentFoot.shoeStyle);
  }, [currentFitResult, currentFoot]);

  if (!currentFoot || !currentFitResult || !gradingResult) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📐</Text>
          <Text className={styles.emptyText}>请先完成脚型录入与楦型适配</Text>
          <Button className={styles.emptyBtn} onClick={() => Taro.switchTab({ url: '/pages/footEntry/index' })}>
            去录入脚型
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.section}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>推档放缩规律</Text>
          <View className={styles.baseInfo}>
            <View className={styles.baseInfoItem}>
              <Text className={styles.baseInfoValue}>{gradingResult.baseSize}</Text>
              <Text className={styles.baseInfoLabel}>基准码</Text>
            </View>
            <View className={styles.baseInfoItem}>
              <Text className={styles.baseInfoValue}>{currentFoot.gender === 'male' ? '男' : '女'}</Text>
              <Text className={styles.baseInfoLabel}>性别</Text>
            </View>
          </View>
          <View className={styles.incInfo}>
            <View className={styles.incItem}>
              <Text className={styles.incValue}>{gradingResult.lengthIncrement}</Text>
              <Text className={styles.incUnit}>mm/码</Text>
              <Text className={styles.incLabel}>长度增量</Text>
            </View>
            <View className={styles.incItem}>
              <Text className={styles.incValue}>{gradingResult.girthIncrement}</Text>
              <Text className={styles.incUnit}>mm/码</Text>
              <Text className={styles.incLabel}>围度增量</Text>
            </View>
            <View className={styles.incItem}>
              <Text className={styles.incValue}>{gradingResult.widthIncrement}</Text>
              <Text className={styles.incUnit}>mm/码</Text>
              <Text className={styles.incLabel}>宽度增量</Text>
            </View>
          </View>
          <View className={styles.tableHeader}>
            <Text className={styles.tableHeaderCell}>码数</Text>
            <Text className={styles.tableHeaderCell}>楦底长</Text>
            <Text className={styles.tableHeaderCell}>跖围</Text>
            <Text className={styles.tableHeaderCell}>背围</Text>
            <Text className={styles.tableHeaderCell}>楦宽</Text>
            <Text className={styles.tableHeaderCell}>前跷</Text>
            <Text className={styles.tableHeaderCell}>后跷</Text>
          </View>
          {gradingResult.rules.map((rule) => (
            <View
              key={rule.size}
              className={classnames(
                styles.tableRow,
                rule.size === gradingResult.baseSize && styles.tableRowHighlight
              )}
            >
              <Text className={classnames(styles.tableCell, styles.tableCellSize)}>{rule.size}</Text>
              <Text className={styles.tableCell}>{rule.lastLength}</Text>
              <Text className={styles.tableCell}>{rule.lastBallGirth}</Text>
              <Text className={styles.tableCell}>{rule.lastInstepGirth}</Text>
              <Text className={styles.tableCell}>{rule.lastWidth}</Text>
              <Text className={styles.tableCell}>{rule.toeSpring}</Text>
              <Text className={styles.tableCell}>{rule.heelSpring}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>前跷后跷校验</Text>
          <View className={styles.springSection}>
            <View className={classnames(styles.springCard, springValidation?.toeOk ? styles.springCardOk : styles.springCardWarn)}>
              <Text className={styles.springLabel}>前跷</Text>
              <Text className={styles.springValue}>{currentFitResult.lastDimensions.toeSpring}</Text>
              <Text className={styles.springUnit}>mm</Text>
              <Text className={classnames(styles.springStatus, springValidation?.toeOk ? styles.springStatusOk : styles.springStatusWarn)}>
                {springValidation?.toeWarning}
              </Text>
            </View>
            <View className={classnames(styles.springCard, springValidation?.heelOk ? styles.springCardOk : styles.springCardWarn)}>
              <Text className={styles.springLabel}>后跷</Text>
              <Text className={styles.springValue}>{currentFitResult.lastDimensions.heelSpring}</Text>
              <Text className={styles.springUnit}>mm</Text>
              <Text className={classnames(styles.springStatus, springValidation?.heelOk ? styles.springStatusOk : styles.springStatusWarn)}>
                {springValidation?.heelWarning}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>皮料延展模拟</Text>
          <View className={styles.leatherSelector}>
            {LEATHER_TYPES.map((l, idx) => (
              <View
                key={l.name}
                className={classnames(styles.leatherItem, selectedLeather === idx && styles.leatherItemActive)}
                onClick={() => setSelectedLeather(idx)}
              >
                <Text>{l.name}</Text>
              </View>
            ))}
          </View>
          {leatherSim && (
            <View className={styles.simResult}>
              <Text className={styles.simTitle}>{LEATHER_TYPES[selectedLeather].name} - {LEATHER_TYPES[selectedLeather].description}</Text>
              <View className={styles.simRow}>
                <Text className={styles.simLabel}>延展率</Text>
                <Text className={styles.simValue}>{leatherSim.stretchPercent}%</Text>
              </View>
              <View className={styles.simRow}>
                <Text className={styles.simLabel}>延展后跖围</Text>
                <Text className={styles.simValue}>{leatherSim.effectiveBallGirth}mm</Text>
              </View>
              <View className={styles.simRow}>
                <Text className={styles.simLabel}>延展后背围</Text>
                <Text className={styles.simValue}>{leatherSim.effectiveInstepGirth}mm</Text>
              </View>
              <Text className={styles.simChange}>{leatherSim.fitChange}</Text>
              <View className={classnames(
                styles.simComfort,
                styles[`comfort${leatherSim.comfortLevel.charAt(0).toUpperCase() + leatherSim.comfortLevel.slice(1)}`]
              )}>
                <Text>穿着舒适度：{COMFORT_LABELS[leatherSim.comfortLevel]}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>鞋面样版展开</Text>
          {upperPattern && (
            <>
              <View className={styles.upperGrid}>
                {upperPattern.vampLength > 0 && (
                  <View className={styles.upperItem}>
                    <Text className={styles.upperValue}>{upperPattern.vampLength}</Text>
                    <Text className={styles.upperUnit}>mm</Text>
                    <Text className={styles.upperLabel}>前帮长度</Text>
                  </View>
                )}
                {upperPattern.vampWidth > 0 && (
                  <View className={styles.upperItem}>
                    <Text className={styles.upperValue}>{upperPattern.vampWidth}</Text>
                    <Text className={styles.upperUnit}>mm</Text>
                    <Text className={styles.upperLabel}>前帮宽度</Text>
                  </View>
                )}
                {upperPattern.quarterLength > 0 && (
                  <View className={styles.upperItem}>
                    <Text className={styles.upperValue}>{upperPattern.quarterLength}</Text>
                    <Text className={styles.upperUnit}>mm</Text>
                    <Text className={styles.upperLabel}>后帮长度</Text>
                  </View>
                )}
                {upperPattern.quarterWidth > 0 && (
                  <View className={styles.upperItem}>
                    <Text className={styles.upperValue}>{upperPattern.quarterWidth}</Text>
                    <Text className={styles.upperUnit}>mm</Text>
                    <Text className={styles.upperLabel}>后帮宽度</Text>
                  </View>
                )}
                {upperPattern.toeCapLength > 0 && (
                  <View className={styles.upperItem}>
                    <Text className={styles.upperValue}>{upperPattern.toeCapLength}</Text>
                    <Text className={styles.upperUnit}>mm</Text>
                    <Text className={styles.upperLabel}>鞋头盖长度</Text>
                  </View>
                )}
                {upperPattern.toeCapWidth > 0 && (
                  <View className={styles.upperItem}>
                    <Text className={styles.upperValue}>{upperPattern.toeCapWidth}</Text>
                    <Text className={styles.upperUnit}>mm</Text>
                    <Text className={styles.upperLabel}>鞋头盖宽度</Text>
                  </View>
                )}
                {upperPattern.tongueLength > 0 && (
                  <View className={styles.upperItem}>
                    <Text className={styles.upperValue}>{upperPattern.tongueLength}</Text>
                    <Text className={styles.upperUnit}>mm</Text>
                    <Text className={styles.upperLabel}>鞋舌长度</Text>
                  </View>
                )}
                {upperPattern.tongueWidth > 0 && (
                  <View className={styles.upperItem}>
                    <Text className={styles.upperValue}>{upperPattern.tongueWidth}</Text>
                    <Text className={styles.upperUnit}>mm</Text>
                    <Text className={styles.upperLabel}>鞋舌宽度</Text>
                  </View>
                )}
              </View>
              <Text className={styles.upperNote}>
                以上为基于楦型反推的鞋面样版展开下料参考尺寸，实际下料需加放缝位8-10mm
              </Text>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default GradingPage;

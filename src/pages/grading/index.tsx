import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useShoeStore } from '@/store/useShoeStore';
import { SHOE_STYLE_LABELS } from '@/types/shoe';
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
  const [showProduction, setShowProduction] = useState(false);

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

  const today = new Date().toISOString().split('T')[0];
  const orderNo = 'PO-' + Date.now().toString().slice(-8);

  const handleGenerateOrder = () => {
    setShowProduction(true);
  };

  const handleConfirmOrder = () => {
    Taro.showToast({ title: '生产单已生成', icon: 'success' });
    setTimeout(() => setShowProduction(false), 800);
  };

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

  const baseSize = gradingResult.baseSize;

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

      <View style={{ height: 180 }} />

      <View className={styles.bottomActions}>
        <Button className={styles.btnProduce} onClick={handleGenerateOrder}>
          📋 生成生产单
        </Button>
      </View>

      {showProduction && (
        <View className={styles.productionModal}>
          <View className={styles.productionContent}>
            <View className={styles.productionHeader}>
              <View>
                <Text className={styles.productionHeaderTitle}>生产单 #{orderNo}</Text>
                <Text className={styles.productionHeaderSub}>{currentFoot.customerName} · {today}</Text>
              </View>
              <View className={styles.productionClose} onClick={() => setShowProduction(false)}>
                <Text>✕</Text>
              </View>
            </View>

            <ScrollView scrollY className={styles.productionBody}>
              <View className={styles.productionCard}>
                <Text className={styles.productionCardTitle}>
                  <Text className={styles.productionCardTitleIcon}>👤</Text>客户与脚型信息
                </Text>
                <View className={styles.productionInfoRow}>
                  <Text className={styles.productionInfoLabel}>客户名称</Text>
                  <Text className={styles.productionInfoValue}>{currentFoot.customerName}</Text>
                </View>
                <View className={styles.productionInfoRow}>
                  <Text className={styles.productionInfoLabel}>性别</Text>
                  <Text className={styles.productionInfoValue}>{currentFoot.gender === 'male' ? '男' : '女'}</Text>
                </View>
                <View className={styles.productionInfoRow}>
                  <Text className={styles.productionInfoLabel}>脚长</Text>
                  <Text className={styles.productionInfoValue}>{currentFoot.footLength}mm</Text>
                </View>
                <View className={styles.productionInfoRow}>
                  <Text className={styles.productionInfoLabel}>跖围</Text>
                  <Text className={styles.productionInfoValue}>{currentFoot.ballGirth}mm</Text>
                </View>
                <View className={styles.productionInfoRow}>
                  <Text className={styles.productionInfoLabel}>脚背高度</Text>
                  <Text className={styles.productionInfoValue}>{currentFoot.instepHeight}mm</Text>
                </View>
                <View className={styles.productionInfoRow}>
                  <Text className={styles.productionInfoLabel}>目标鞋款</Text>
                  <Text className={styles.productionInfoValue}>{SHOE_STYLE_LABELS[currentFoot.shoeStyle]}</Text>
                </View>
                <View className={styles.productionInfoRow}>
                  <Text className={styles.productionInfoLabel}>基准码</Text>
                  <Text className={styles.productionInfoValue}>{baseSize}码</Text>
                </View>
              </View>

              <View className={styles.productionCard}>
                <Text className={styles.productionCardTitle}>
                  <Text className={styles.productionCardTitleIcon}>📐</Text>全码楦型推档表
                </Text>
                <View className={styles.productionTable}>
                  <View className={styles.productionTableHeader}>
                    <Text className={styles.productionTableHeaderCell}>码数</Text>
                    <Text className={styles.productionTableHeaderCell}>楦底长</Text>
                    <Text className={styles.productionTableHeaderCell}>跖围</Text>
                    <Text className={styles.productionTableHeaderCell}>背围</Text>
                    <Text className={styles.productionTableHeaderCell}>楦宽</Text>
                    <Text className={styles.productionTableHeaderCell}>前跷</Text>
                    <Text className={styles.productionTableHeaderCell}>后跷</Text>
                  </View>
                  {gradingResult.rules.map((rule) => (
                    <View
                      key={rule.size}
                      className={classnames(
                        styles.productionTableRow,
                        rule.size === baseSize && styles.productionTableRowHighlight
                      )}
                    >
                      <Text className={classnames(styles.productionTableCell, styles.productionTableCellSize)}>{rule.size}</Text>
                      <Text className={styles.productionTableCell}>{rule.lastLength}</Text>
                      <Text className={styles.productionTableCell}>{rule.lastBallGirth}</Text>
                      <Text className={styles.productionTableCell}>{rule.lastInstepGirth}</Text>
                      <Text className={styles.productionTableCell}>{rule.lastWidth}</Text>
                      <Text className={styles.productionTableCell}>{rule.toeSpring}</Text>
                      <Text className={styles.productionTableCell}>{rule.heelSpring}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.productionCard}>
                <Text className={styles.productionCardTitle}>
                  <Text className={styles.productionCardTitleIcon}>⚖️</Text>前跷后跷校验结果
                </Text>
                <View className={classnames(
                  styles.productionWarning,
                  springValidation?.toeOk && styles.productionWarningOk
                )}>
                  <Text className={styles.productionWarningText}>
                    前跷 {currentFitResult.lastDimensions.toeSpring}mm：{springValidation?.toeWarning}
                  </Text>
                </View>
                <View className={classnames(
                  styles.productionWarning,
                  springValidation?.heelOk && styles.productionWarningOk
                )}>
                  <Text className={styles.productionWarningText}>
                    后跷 {currentFitResult.lastDimensions.heelSpring}mm：{springValidation?.heelWarning}
                  </Text>
                </View>
              </View>

              {leatherSim && (
                <View className={classnames(styles.productionCard, styles.productionLeatherCard)}>
                  <Text className={styles.productionCardTitle}>
                    <Text className={styles.productionCardTitleIcon}>🧵</Text>皮料规格
                  </Text>
                  <View className={styles.productionInfoRow}>
                    <Text className={styles.productionInfoLabel}>皮料类型</Text>
                    <Text className={styles.productionInfoValue}>{LEATHER_TYPES[selectedLeather].name}</Text>
                  </View>
                  <View className={styles.productionInfoRow}>
                    <Text className={styles.productionInfoLabel}>皮料特性</Text>
                    <Text className={styles.productionInfoValue}>{LEATHER_TYPES[selectedLeather].description}</Text>
                  </View>
                  <View className={styles.productionInfoRow}>
                    <Text className={styles.productionInfoLabel}>皮厚</Text>
                    <Text className={styles.productionInfoValue}>{LEATHER_TYPES[selectedLeather].thickness}mm</Text>
                  </View>
                  <View className={styles.productionInfoRow}>
                    <Text className={styles.productionInfoLabel}>延展率</Text>
                    <Text className={styles.productionInfoValue}>{leatherSim.stretchPercent}%</Text>
                  </View>
                  <View className={styles.productionInfoRow}>
                    <Text className={styles.productionInfoLabel}>穿着后有效跖围</Text>
                    <Text className={styles.productionInfoValue}>{leatherSim.effectiveBallGirth}mm</Text>
                  </View>
                  <View className={styles.productionInfoRow}>
                    <Text className={styles.productionInfoLabel}>穿着舒适度</Text>
                    <Text className={styles.productionInfoValue}>{COMFORT_LABELS[leatherSim.comfortLevel]}</Text>
                  </View>
                  <View className={styles.productionInfoRow}>
                    <Text className={styles.productionInfoLabel}>变化说明</Text>
                    <Text className={styles.productionInfoValue}>{leatherSim.fitChange}</Text>
                  </View>
                </View>
              )}

              {upperPattern && (
                <View className={styles.productionCard}>
                  <Text className={styles.productionCardTitle}>
                    <Text className={styles.productionCardTitleIcon}>✂️</Text>鞋面样版下料尺寸
                  </Text>
                  {upperPattern.vampLength > 0 && (
                    <View className={styles.productionInfoRow}>
                      <Text className={styles.productionInfoLabel}>前帮长度</Text>
                      <Text className={styles.productionInfoValue}>{upperPattern.vampLength}mm</Text>
                    </View>
                  )}
                  {upperPattern.vampWidth > 0 && (
                    <View className={styles.productionInfoRow}>
                      <Text className={styles.productionInfoLabel}>前帮宽度</Text>
                      <Text className={styles.productionInfoValue}>{upperPattern.vampWidth}mm</Text>
                    </View>
                  )}
                  {upperPattern.quarterLength > 0 && (
                    <View className={styles.productionInfoRow}>
                      <Text className={styles.productionInfoLabel}>后帮长度</Text>
                      <Text className={styles.productionInfoValue}>{upperPattern.quarterLength}mm</Text>
                    </View>
                  )}
                  {upperPattern.quarterWidth > 0 && (
                    <View className={styles.productionInfoRow}>
                      <Text className={styles.productionInfoLabel}>后帮宽度</Text>
                      <Text className={styles.productionInfoValue}>{upperPattern.quarterWidth}mm</Text>
                    </View>
                  )}
                  {upperPattern.toeCapLength > 0 && (
                    <View className={styles.productionInfoRow}>
                      <Text className={styles.productionInfoLabel}>鞋头盖长度</Text>
                      <Text className={styles.productionInfoValue}>{upperPattern.toeCapLength}mm</Text>
                    </View>
                  )}
                  {upperPattern.toeCapWidth > 0 && (
                    <View className={styles.productionInfoRow}>
                      <Text className={styles.productionInfoLabel}>鞋头盖宽度</Text>
                      <Text className={styles.productionInfoValue}>{upperPattern.toeCapWidth}mm</Text>
                    </View>
                  )}
                  {upperPattern.tongueLength > 0 && (
                    <View className={styles.productionInfoRow}>
                      <Text className={styles.productionInfoLabel}>鞋舌长度</Text>
                      <Text className={styles.productionInfoValue}>{upperPattern.tongueLength}mm</Text>
                    </View>
                  )}
                  {upperPattern.tongueWidth > 0 && (
                    <View className={styles.productionInfoRow}>
                      <Text className={styles.productionInfoLabel}>鞋舌宽度</Text>
                      <Text className={styles.productionInfoValue}>{upperPattern.tongueWidth}mm</Text>
                    </View>
                  )}
                  <View className={styles.productionInfoGap} />
                  <View className={classnames(styles.productionWarning, styles.productionWarningOk)}>
                    <Text className={styles.productionWarningText}>
                      注意：以上为参考下料尺寸，实际下料需加放缝位8-10mm
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View className={styles.productionFooter}>
              <Button className={styles.btnConfirm} onClick={handleConfirmOrder}>
                确认生产单
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default GradingPage;

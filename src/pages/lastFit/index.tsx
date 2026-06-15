import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useShoeStore } from '@/store/useShoeStore';
import { performLastFit } from '@/utils/shoeCalculations';
import { SHOE_STYLE_LABELS, TOE_SHAPE_LABELS, ARCH_TYPE_LABELS, GENDER_LABELS } from '@/types/shoe';
import styles from './index.module.scss';

const FIT_LABELS: Record<string, string> = {
  excellent: '完美适配',
  good: '适配良好',
  acceptable: '可接受适配',
  poor: '适配偏差大'
};

const FIT_ICONS: Record<string, string> = {
  excellent: '✓',
  good: '○',
  acceptable: '△',
  poor: '✗'
};

const STATUS_LABELS: Record<string, string> = {
  good: '适配',
  tight: '偏紧',
  loose: '偏松'
};

const LastFitPage: React.FC = () => {
  const { currentFoot, currentFitResult, setCurrentFitResult, saveOrUpdateArchive, addRecentFoot } = useShoeStore();

  const fitResult = useMemo(() => {
    if (currentFitResult) return currentFitResult;
    if (!currentFoot) return null;
    return performLastFit(currentFoot);
  }, [currentFoot, currentFitResult]);

  const handleSaveAndGrade = () => {
    if (!fitResult || !currentFoot) return;
    setCurrentFitResult(fitResult);
    addRecentFoot(currentFoot);
    Taro.switchTab({ url: '/pages/grading/index' });
  };

  const handleReEntry = () => {
    Taro.switchTab({ url: '/pages/footEntry/index' });
  };

  const handleSaveArchive = () => {
    if (!currentFoot || !fitResult) return;
    setCurrentFitResult(fitResult);
    addRecentFoot(currentFoot);
    const archive = saveOrUpdateArchive(currentFoot, fitResult);
    const isNew = !archive.id || archive.createdAt === archive.updatedAt;
    Taro.showToast({
      title: isNew ? '已新建档案' : '已追加到档案',
      icon: 'success'
    });
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/archive/index' });
    }, 800);
  };

  if (!currentFoot) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>👞</Text>
          <Text className={styles.emptyText}>请先录入脚型数据</Text>
          <Button className={styles.emptyBtn} onClick={handleReEntry}>
            去录入脚型
          </Button>
        </View>
      </View>
    );
  }

  const { lastDimensions, deviations, overallFit, riskWarnings } = fitResult;

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.footSummary}>
        <View className={styles.summaryHeader}>
          <Text className={styles.summaryTitle}>{currentFoot.customerName} 脚型数据</Text>
          <Text className={styles.summarySize}>{lastDimensions.shoeSize}码</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>脚长</Text>
          <Text className={styles.summaryValue}>{currentFoot.footLength}mm</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>跖围</Text>
          <Text className={styles.summaryValue}>{currentFoot.ballGirth}mm</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>脚背高度</Text>
          <Text className={styles.summaryValue}>{currentFoot.instepHeight}mm</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>趾型</Text>
          <Text className={styles.summaryValue}>{TOE_SHAPE_LABELS[currentFoot.toeShape]}</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>足弓</Text>
          <Text className={styles.summaryValue}>{ARCH_TYPE_LABELS[currentFoot.archType]}</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>目标鞋款</Text>
          <Text className={styles.summaryValue}>{SHOE_STYLE_LABELS[currentFoot.shoeStyle]}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>推荐楦型尺寸</Text>
          <View className={styles.dimGrid}>
            <View className={styles.dimItem}>
              <Text className={styles.dimValue}>{lastDimensions.lastLength}</Text>
              <Text className={styles.dimUnit}>mm</Text>
              <Text className={styles.dimLabel}>楦底长</Text>
            </View>
            <View className={styles.dimItem}>
              <Text className={styles.dimValue}>{lastDimensions.lastBallGirth}</Text>
              <Text className={styles.dimUnit}>mm</Text>
              <Text className={styles.dimLabel}>楦跖围</Text>
            </View>
            <View className={styles.dimItem}>
              <Text className={styles.dimValue}>{lastDimensions.lastInstepGirth}</Text>
              <Text className={styles.dimUnit}>mm</Text>
              <Text className={styles.dimLabel}>楦背围</Text>
            </View>
            <View className={styles.dimItem}>
              <Text className={styles.dimValue}>{lastDimensions.lastWidth}</Text>
              <Text className={styles.dimUnit}>mm</Text>
              <Text className={styles.dimLabel}>楦宽</Text>
            </View>
            <View className={styles.dimItem}>
              <Text className={styles.dimValue}>{lastDimensions.toeSpring}</Text>
              <Text className={styles.dimUnit}>mm</Text>
              <Text className={styles.dimLabel}>前跷</Text>
            </View>
            <View className={styles.dimItem}>
              <Text className={styles.dimValue}>{lastDimensions.heelSpring}</Text>
              <Text className={styles.dimUnit}>mm</Text>
              <Text className={styles.dimLabel}>后跷</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.card}>
          <Text className={styles.cardTitle}>适配偏差分析</Text>
          {deviations.map((dev, idx) => (
            <View key={idx} className={styles.devItem}>
              <View className={styles.devLeft}>
                <Text className={styles.devDimension}>{dev.dimension}</Text>
                <Text className={styles.devDesc}>{dev.description}</Text>
              </View>
              <View className={styles.devRight}>
                <Text className={classnames(
                  styles.devValue,
                  dev.status === 'good' && styles.devValueGood,
                  dev.status === 'tight' && styles.devValueTight,
                  dev.status === 'loose' && styles.devValueLoose
                )}>
                  +{dev.deviation}mm
                </Text>
                <Text className={classnames(
                  styles.devBadge,
                  dev.status === 'good' && styles.devBadgeGood,
                  dev.status === 'tight' && styles.devBadgeTight,
                  dev.status === 'loose' && styles.devBadgeLoose
                )}>
                  {STATUS_LABELS[dev.status]}
                </Text>
              </View>
            </View>
          ))}
          <View className={classnames(
            styles.fitOverall,
            styles[`fit${overallFit.charAt(0).toUpperCase() + overallFit.slice(1)}`]
          )}>
            <Text className={styles.fitLabel}>
              {FIT_ICONS[overallFit]} {FIT_LABELS[overallFit]}
            </Text>
          </View>
        </View>
      </View>

      {riskWarnings.length > 0 && (
        <View className={styles.section}>
          <View className={styles.card}>
            <Text className={styles.cardTitle}>风险预警</Text>
            {riskWarnings.map((w, idx) => (
              <View
                key={idx}
                className={classnames(
                  styles.warningItem,
                  w.severity === 'medium' && styles.mediumWarning,
                  w.severity === 'low' && styles.lowWarning
                )}
              >
                <Text className={styles.warningIcon}>
                  {w.severity === 'high' ? '🔴' : w.severity === 'medium' ? '🟡' : '🟢'}
                </Text>
                <View className={styles.warningContent}>
                  <Text className={styles.warningTitle}>{w.location} - {w.description}</Text>
                  <Text className={styles.warningDesc}>{w.suggestion}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {riskWarnings.length === 0 && (
        <View className={styles.section}>
          <View className={styles.card}>
            <Text className={styles.cardTitle}>风险预警</Text>
            <View className={styles.noWarning}>
              <Text>✓ 无风险预警，楦型适配安全</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.bottomBar}>
        <Button className={styles.btnSecondary} onClick={handleSaveArchive}>
          保存档案
        </Button>
        <Button className={styles.btnPrimary} onClick={handleSaveAndGrade}>
          生成推档方案
        </Button>
      </View>
    </ScrollView>
  );
};

export default LastFitPage;

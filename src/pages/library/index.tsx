import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useShoeStore, generateId } from '@/store/useShoeStore';
import type { PatternLibrary, ShoeStyle } from '@/types/shoe';
import { SHOE_STYLE_LABELS } from '@/types/shoe';
import styles from './index.module.scss';

const STYLE_FILTERS: (ShoeStyle | 'all')[] = ['all', 'oxford', 'derby', 'loafer', 'boot', 'monk', 'chelsea'];

const LibraryPage: React.FC = () => {
  const { patternLibrary, removeFromLibrary, applyPattern, currentFoot, currentFitResult } = useShoeStore();
  const [activeFilter, setActiveFilter] = useState<ShoeStyle | 'all'>('all');
  const [selectedPattern, setSelectedPattern] = useState<PatternLibrary | null>(null);

  const filteredPatterns = useMemo(() => {
    if (activeFilter === 'all') return patternLibrary;
    return patternLibrary.filter((p) => p.shoeStyle === activeFilter);
  }, [patternLibrary, activeFilter]);

  const handleUse = (pattern: PatternLibrary) => {
    applyPattern(pattern);
    setSelectedPattern(null);
    Taro.showToast({ title: '版型已应用', icon: 'success' });
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/lastFit/index' });
    }, 800);
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确认删除该版型？',
      success: (res) => {
        if (res.confirm) {
          removeFromLibrary(id);
          Taro.showToast({ title: '已删除', icon: 'success' });
          if (selectedPattern?.id === id) {
            setSelectedPattern(null);
          }
        }
      }
    });
  };

  const handleAddCurrent = () => {
    if (!currentFoot || !currentFitResult) {
      Taro.showToast({ title: '请先完成脚型适配', icon: 'none' });
      return;
    }
    const newPattern: PatternLibrary = {
      id: generateId(),
      name: `${currentFoot.customerName}的${SHOE_STYLE_LABELS[currentFoot.shoeStyle]}楦型`,
      description: `${currentFoot.customerName}定制方案，跖围放量${currentFitResult.lastDimensions.lastBallGirth - currentFoot.ballGirth}mm`,
      footType: `${currentFoot.toeShape === 'egyptian' ? '埃及脚' : currentFoot.toeShape === 'greek' ? '希腊脚' : '方形脚'}·${currentFoot.archType === 'high' ? '高足弓' : currentFoot.archType === 'flat' ? '扁平足' : '正常足弓'}`,
      shoeStyle: currentFoot.shoeStyle,
      gender: currentFoot.gender,
      footMeasurement: currentFoot,
      lastDimensions: currentFitResult.lastDimensions,
      deviations: currentFitResult.deviations,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    };
    const { addToLibrary } = useShoeStore.getState();
    addToLibrary(newPattern);
    Taro.showToast({ title: '已添加到版型库', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>版型库</Text>
        <Text className={styles.headerCount}>共 {patternLibrary.length} 套版型</Text>
      </View>

      <ScrollView scrollX className={styles.filterBar}>
        {STYLE_FILTERS.map((f) => (
          <View
            key={f}
            className={classnames(styles.filterItem, activeFilter === f && styles.filterItemActive)}
            onClick={() => setActiveFilter(f)}
          >
            <Text>{f === 'all' ? '全部' : SHOE_STYLE_LABELS[f]}</Text>
          </View>
        ))}
      </ScrollView>

      {filteredPatterns.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📚</Text>
          <Text className={styles.emptyText}>暂无版型数据</Text>
        </View>
      ) : (
        <ScrollView scrollY className={styles.patternList}>
          {filteredPatterns.map((pattern) => (
            <View key={pattern.id} className={styles.patternCard} onClick={() => setSelectedPattern(pattern)}>
              <View className={styles.patternHeader}>
                <Text className={styles.patternName}>{pattern.name}</Text>
                <Text className={styles.patternUsage}>使用 {pattern.usageCount} 次</Text>
              </View>
              <Text className={styles.patternDesc}>{pattern.description}</Text>
              <View className={styles.patternTags}>
                <Text className={styles.patternTag}>{pattern.footType}</Text>
                <Text className={styles.patternTag}>{SHOE_STYLE_LABELS[pattern.shoeStyle]}</Text>
                <Text className={styles.patternTag}>{pattern.gender === 'male' ? '男款' : '女款'}</Text>
              </View>
              <View className={styles.patternDims}>
                <View className={styles.patternDim}>
                  <Text className={styles.patternDimValue}>{pattern.lastDimensions.lastLength}</Text>
                  <Text className={styles.patternDimUnit}>mm</Text>
                  <Text className={styles.patternDimLabel}>楦底长</Text>
                </View>
                <View className={styles.patternDim}>
                  <Text className={styles.patternDimValue}>{pattern.lastDimensions.lastBallGirth}</Text>
                  <Text className={styles.patternDimUnit}>mm</Text>
                  <Text className={styles.patternDimLabel}>楦跖围</Text>
                </View>
                <View className={styles.patternDim}>
                  <Text className={styles.patternDimValue}>{pattern.lastDimensions.shoeSize}</Text>
                  <Text className={styles.patternDimUnit}>码</Text>
                  <Text className={styles.patternDimLabel}>基准码</Text>
                </View>
              </View>
              <View className={styles.patternFooter}>
                <Button
                  className={classnames(styles.patternBtn, styles.patternBtnUse)}
                  onClick={(e) => { e.stopPropagation(); handleUse(pattern); }}
                >
                  应用此版型
                </Button>
                <Button
                  className={classnames(styles.patternBtn, styles.patternBtnDel)}
                  onClick={(e) => { e.stopPropagation(); handleDelete(pattern.id); }}
                >
                  删除
                </Button>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View className={styles.bottomBar}>
        <Button className={styles.btnAdd} onClick={handleAddCurrent}>
          保存当前方案到版型库
        </Button>
      </View>

      {selectedPattern && (
        <View className={styles.detailModal} onClick={() => setSelectedPattern(null)}>
          <View className={styles.detailContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.detailHandle} />
            <Text className={styles.detailTitle}>{selectedPattern.name}</Text>
            <Text className={styles.detailDesc}>{selectedPattern.description}</Text>

            <View className={styles.detailSection}>
              <Text className={styles.detailSectionTitle}>脚型数据</Text>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>脚长</Text>
                <Text className={styles.detailValue}>{selectedPattern.footMeasurement.footLength}mm</Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>跖围</Text>
                <Text className={styles.detailValue}>{selectedPattern.footMeasurement.ballGirth}mm</Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>脚背高度</Text>
                <Text className={styles.detailValue}>{selectedPattern.footMeasurement.instepHeight}mm</Text>
              </View>
            </View>

            <View className={styles.detailSection}>
              <Text className={styles.detailSectionTitle}>楦型尺寸</Text>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>楦底长</Text>
                <Text className={styles.detailValue}>{selectedPattern.lastDimensions.lastLength}mm</Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>楦跖围</Text>
                <Text className={styles.detailValue}>{selectedPattern.lastDimensions.lastBallGirth}mm</Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>楦背围</Text>
                <Text className={styles.detailValue}>{selectedPattern.lastDimensions.lastInstepGirth}mm</Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>楦宽</Text>
                <Text className={styles.detailValue}>{selectedPattern.lastDimensions.lastWidth}mm</Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>前跷</Text>
                <Text className={styles.detailValue}>{selectedPattern.lastDimensions.toeSpring}mm</Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>后跷</Text>
                <Text className={styles.detailValue}>{selectedPattern.lastDimensions.heelSpring}mm</Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>基准码</Text>
                <Text className={styles.detailValue}>{selectedPattern.lastDimensions.shoeSize}码</Text>
              </View>
            </View>

            <View className={styles.detailActions}>
              <Button className={styles.detailApplyBtn} onClick={() => selectedPattern && handleUse(selectedPattern)}>
                应用此版型
              </Button>
            </View>
            <Button className={styles.detailClose} onClick={() => setSelectedPattern(null)}>
              关闭
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default LibraryPage;

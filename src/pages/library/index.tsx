import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useShoeStore, generateId } from '@/store/useShoeStore';
import type { PatternLibrary, ShoeStyle, LastDimensions } from '@/types/shoe';
import { SHOE_STYLE_LABELS } from '@/types/shoe';
import styles from './index.module.scss';

const STYLE_FILTERS: (ShoeStyle | 'all')[] = ['all', 'oxford', 'derby', 'loafer', 'boot', 'monk', 'chelsea'];
const GENDER_FILTERS: ('all' | 'male' | 'female')[] = ['all', 'male', 'female'];
const FOOT_FILTERS: ('all' | 'normal' | 'high' | 'flat')[] = ['all', 'normal', 'high', 'flat'];

type SortKey = 'usage' | 'date' | 'name';

interface EditState {
  name: string;
  description: string;
  lastLength: string;
  lastBallGirth: string;
  lastInstepGirth: string;
  lastWidth: string;
  toeSpring: string;
  heelSpring: string;
  shoeSize: string;
}

const LibraryPage: React.FC = () => {
  const { patternLibrary, removeFromLibrary, applyPattern, currentFoot, currentFitResult,
    addToLibrary, duplicatePattern, updateLibraryPattern } = useShoeStore();
  const [activeStyle, setActiveStyle] = useState<ShoeStyle | 'all'>('all');
  const [activeGender, setActiveGender] = useState<'all' | 'male' | 'female'>('all');
  const [activeFoot, setActiveFoot] = useState<'all' | 'normal' | 'high' | 'flat'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('usage');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<PatternLibrary | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<EditState>({
    name: '', description: '', lastLength: '', lastBallGirth: '',
    lastInstepGirth: '', lastWidth: '', toeSpring: '', heelSpring: '', shoeSize: ''
  });

  const filteredPatterns = useMemo(() => {
    let list = [...patternLibrary];

    if (activeStyle !== 'all') {
      list = list.filter(p => p.shoeStyle === activeStyle);
    }
    if (activeGender !== 'all') {
      list = list.filter(p => p.gender === activeGender);
    }
    if (activeFoot !== 'all') {
      list = list.filter(p => p.footMeasurement.archType === activeFoot);
    }

    list.sort((a, b) => {
      if (sortKey === 'usage') {
        return sortAsc ? a.usageCount - b.usageCount : b.usageCount - a.usageCount;
      }
      if (sortKey === 'date') {
        return sortAsc ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt);
      }
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });

    return list;
  }, [patternLibrary, activeStyle, activeGender, activeFoot, sortKey, sortAsc]);

  const initEditState = (pattern: PatternLibrary) => {
    setEditState({
      name: pattern.name,
      description: pattern.description,
      lastLength: String(pattern.lastDimensions.lastLength),
      lastBallGirth: String(pattern.lastDimensions.lastBallGirth),
      lastInstepGirth: String(pattern.lastDimensions.lastInstepGirth),
      lastWidth: String(pattern.lastDimensions.lastWidth),
      toeSpring: String(pattern.lastDimensions.toeSpring),
      heelSpring: String(pattern.lastDimensions.heelSpring),
      shoeSize: String(pattern.lastDimensions.shoeSize),
    });
  };

  const handleUse = (pattern: PatternLibrary) => {
    applyPattern(pattern);
    setSelectedPattern(null);
    setIsEditing(false);
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

  const handleDuplicate = (pattern: PatternLibrary) => {
    const newPattern = duplicatePattern(pattern.id);
    if (newPattern) {
      setSelectedPattern(newPattern);
      initEditState(newPattern);
      setIsEditing(true);
      Taro.showToast({ title: '已复制为新版本', icon: 'success' });
    }
  };

  const handleEditSave = () => {
    if (!selectedPattern || !editState.name.trim()) {
      Taro.showToast({ title: '请填写版型名称', icon: 'none' });
      return;
    }

    const num = (v: string) => parseFloat(v) || 0;

    const newLastDimensions: LastDimensions = {
      lastLength: num(editState.lastLength),
      lastBallGirth: num(editState.lastBallGirth),
      lastInstepGirth: num(editState.lastInstepGirth),
      lastHeelGirth: selectedPattern.lastDimensions.lastHeelGirth,
      lastWidth: num(editState.lastWidth),
      toeSpring: num(editState.toeSpring),
      heelSpring: num(editState.heelSpring),
      shoeSize: num(editState.shoeSize),
    };

    updateLibraryPattern(selectedPattern.id, {
      name: editState.name.trim(),
      description: editState.description.trim(),
      lastDimensions: newLastDimensions,
    });

    const updated = patternLibrary.find(p => p.id === selectedPattern.id);
    if (updated) {
      setSelectedPattern({ ...updated });
    }

    setIsEditing(false);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleCancelEdit = () => {
    if (selectedPattern) {
      initEditState(selectedPattern);
    }
    setIsEditing(false);
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
    addToLibrary(newPattern);
    Taro.showToast({ title: '已添加到版型库', icon: 'success' });
  };

  const toggleSort = () => {
    if (sortKey === 'usage') {
      setSortKey('date');
      setSortAsc(false);
    } else if (sortKey === 'date') {
      setSortKey('name');
      setSortAsc(true);
    } else {
      setSortKey('usage');
      setSortAsc(false);
    }
  };

  const sortLabel = sortKey === 'usage' ? '使用次数' : sortKey === 'date' ? '创建时间' : '名称';

  const handleOpenDetail = (pattern: PatternLibrary) => {
    setSelectedPattern(pattern);
    initEditState(pattern);
    setIsEditing(false);
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>版型库</Text>
        <Text className={styles.headerCount}>共 {patternLibrary.length} 套版型</Text>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>鞋款类型</Text>
        <ScrollView scrollX className={styles.filterRow}>
          {STYLE_FILTERS.map((f) => (
            <View
              key={f}
              className={classnames(styles.filterItem, activeStyle === f && styles.filterItemActive)}
              onClick={() => setActiveStyle(f)}
            >
              <Text>{f === 'all' ? '全部' : SHOE_STYLE_LABELS[f]}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>性别</Text>
        <View className={styles.filterRow}>
          {GENDER_FILTERS.map((f) => (
            <View
              key={f}
              className={classnames(styles.filterItem, activeGender === f && styles.filterItemActive)}
              onClick={() => setActiveGender(f)}
            >
              <Text>{f === 'all' ? '全部' : f === 'male' ? '男款' : '女款'}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>足弓类型</Text>
        <View className={styles.filterRow}>
          {FOOT_FILTERS.map((f) => (
            <View
              key={f}
              className={classnames(styles.filterItem, activeFoot === f && styles.filterItemActive)}
              onClick={() => setActiveFoot(f)}
            >
              <Text>
                {f === 'all' ? '全部' : f === 'normal' ? '正常足弓' : f === 'high' ? '高足弓' : '扁平足'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sortBar} onClick={toggleSort}>
        <Text className={styles.sortLabel}>
          筛选 {filteredPatterns.length} 套
        </Text>
        <View className={styles.sortSelect}>
          <Text>排序：{sortLabel}</Text>
          <Text className={styles.sortArrow}>{sortAsc ? '↑' : '↓'}</Text>
        </View>
      </View>

      {filteredPatterns.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📚</Text>
          <Text className={styles.emptyText}>暂无符合条件的版型</Text>
        </View>
      ) : (
        <ScrollView scrollY className={styles.patternList}>
          {filteredPatterns.map((pattern) => (
            <View key={pattern.id} className={styles.patternCard} onClick={() => handleOpenDetail(pattern)}>
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
              <View className={styles.patternCardFooter}>
                <View className={styles.patternMeta}>
                  <Text className={styles.patternMetaTag}>创建：{pattern.createdAt}</Text>
                </View>
                <View className={styles.patternActions}>
                  <Button
                    className={classnames(styles.patternBtn, styles.patternBtnDel)}
                    onClick={(e) => { e.stopPropagation(); handleDelete(pattern.id); }}
                  >
                    删除
                  </Button>
                  <Button
                    className={classnames(styles.patternBtn, styles.patternBtnUse)}
                    onClick={(e) => { e.stopPropagation(); handleUse(pattern); }}
                  >
                    应用此版型
                  </Button>
                </View>
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
        <View className={styles.detailModal} onClick={() => { setSelectedPattern(null); setIsEditing(false); }}>
          <View className={styles.detailContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.detailHandle} />

            {isEditing ? (
              <>
                <Text className={styles.detailTitle}>编辑版型</Text>

                <View className={styles.detailSection}>
                  <Text className={styles.detailSectionTitle}>基本信息</Text>
                  <View className={styles.editRow}>
                    <Text className={styles.editLabel}>版型名称</Text>
                    <Input
                      className={styles.editInput}
                      value={editState.name}
                      onInput={(e) => setEditState(s => ({ ...s, name: e.detail.value }))}
                      placeholder='请输入版型名称'
                    />
                  </View>
                  <View className={styles.editRow}>
                    <Text className={styles.editLabel}>描述</Text>
                    <Textarea
                      className={styles.editTextarea}
                      value={editState.description}
                      onInput={(e) => setEditState(s => ({ ...s, description: e.detail.value }))}
                      placeholder='请输入版型描述'
                    />
                  </View>
                </View>

                <View className={styles.detailSection}>
                  <Text className={styles.detailSectionTitle}>楦型尺寸（可微调）</Text>
                  <View className={styles.editGrid}>
                    <View className={styles.editItem}>
                      <Text className={styles.editItemLabel}>楦底长(mm)</Text>
                      <Input
                        type='digit'
                        className={styles.editItemInput}
                        value={editState.lastLength}
                        onInput={(e) => setEditState(s => ({ ...s, lastLength: e.detail.value }))}
                      />
                    </View>
                    <View className={styles.editItem}>
                      <Text className={styles.editItemLabel}>楦跖围(mm)</Text>
                      <Input
                        type='digit'
                        className={styles.editItemInput}
                        value={editState.lastBallGirth}
                        onInput={(e) => setEditState(s => ({ ...s, lastBallGirth: e.detail.value }))}
                      />
                    </View>
                    <View className={styles.editItem}>
                      <Text className={styles.editItemLabel}>楦背围(mm)</Text>
                      <Input
                        type='digit'
                        className={styles.editItemInput}
                        value={editState.lastInstepGirth}
                        onInput={(e) => setEditState(s => ({ ...s, lastInstepGirth: e.detail.value }))}
                      />
                    </View>
                    <View className={styles.editItem}>
                      <Text className={styles.editItemLabel}>楦宽(mm)</Text>
                      <Input
                        type='digit'
                        className={styles.editItemInput}
                        value={editState.lastWidth}
                        onInput={(e) => setEditState(s => ({ ...s, lastWidth: e.detail.value }))}
                      />
                    </View>
                    <View className={styles.editItem}>
                      <Text className={styles.editItemLabel}>前跷(mm)</Text>
                      <Input
                        type='digit'
                        className={styles.editItemInput}
                        value={editState.toeSpring}
                        onInput={(e) => setEditState(s => ({ ...s, toeSpring: e.detail.value }))}
                      />
                    </View>
                    <View className={styles.editItem}>
                      <Text className={styles.editItemLabel}>后跷(mm)</Text>
                      <Input
                        type='digit'
                        className={styles.editItemInput}
                        value={editState.heelSpring}
                        onInput={(e) => setEditState(s => ({ ...s, heelSpring: e.detail.value }))}
                      />
                    </View>
                    <View className={styles.editItem}>
                      <Text className={styles.editItemLabel}>基准码</Text>
                      <Input
                        type='digit'
                        className={styles.editItemInput}
                        value={editState.shoeSize}
                        onInput={(e) => setEditState(s => ({ ...s, shoeSize: e.detail.value }))}
                      />
                    </View>
                  </View>
                </View>

                <View className={styles.detailActions}>
                  <Button className={styles.detailCopyBtn} onClick={handleCancelEdit}>
                    取消
                  </Button>
                  <Button className={styles.detailApplyBtn} onClick={handleEditSave}>
                    保存版型
                  </Button>
                </View>
              </>
            ) : (
              <>
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
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>足弓</Text>
                    <Text className={styles.detailValue}>
                      {selectedPattern.footMeasurement.archType === 'high' ? '高足弓' : selectedPattern.footMeasurement.archType === 'flat' ? '扁平足' : '正常足弓'}
                    </Text>
                  </View>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>鞋款</Text>
                    <Text className={styles.detailValue}>{SHOE_STYLE_LABELS[selectedPattern.shoeStyle]}</Text>
                  </View>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>使用次数</Text>
                    <Text className={styles.detailValue}>{selectedPattern.usageCount} 次</Text>
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
                    <Text className={styles.detailLabel}>前跷 / 后跷</Text>
                    <Text className={styles.detailValue}>
                      {selectedPattern.lastDimensions.toeSpring} / {selectedPattern.lastDimensions.heelSpring}mm
                    </Text>
                  </View>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>基准码</Text>
                    <Text className={styles.detailValue}>{selectedPattern.lastDimensions.shoeSize}码</Text>
                  </View>
                </View>

                <View className={styles.detailActions}>
                  <Button className={styles.detailCopyBtn} onClick={() => handleDuplicate(selectedPattern)}>
                    📋 复制为新版
                  </Button>
                  <Button className={styles.detailApplyBtn} onClick={() => { initEditState(selectedPattern); setIsEditing(true); }}>
                    ✏️ 编辑
                  </Button>
                </View>

                <View className={styles.detailActions}>
                  <Button className={styles.detailApplyBtn} onClick={() => handleUse(selectedPattern)}>
                    应用此版型
                  </Button>
                </View>

                <Button className={styles.detailClose} onClick={() => { setSelectedPattern(null); setIsEditing(false); }}>
                  关闭
                </Button>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default LibraryPage;

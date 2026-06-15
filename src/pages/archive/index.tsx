import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useShoeStore, generateId } from '@/store/useShoeStore';
import type { CustomerArchive } from '@/types/shoe';
import { SHOE_STYLE_LABELS, TOE_SHAPE_LABELS, ARCH_TYPE_LABELS } from '@/types/shoe';
import { performLastFit } from '@/utils/shoeCalculations';
import styles from './index.module.scss';

const ArchivePage: React.FC = () => {
  const { archives, deleteArchive, updateArchive, currentFoot, currentFitResult } = useShoeStore();
  const [searchText, setSearchText] = useState('');
  const [selectedArchive, setSelectedArchive] = useState<CustomerArchive | null>(null);

  const filteredArchives = useMemo(() => {
    if (!searchText.trim()) return archives;
    const keyword = searchText.trim().toLowerCase();
    return archives.filter(
      (a) =>
        a.customerName.toLowerCase().includes(keyword) ||
        a.phone.includes(keyword)
    );
  }, [archives, searchText]);

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确认删除该档案？',
      success: (res) => {
        if (res.confirm) {
          deleteArchive(id);
          Taro.showToast({ title: '已删除', icon: 'success' });
          if (selectedArchive?.id === id) {
            setSelectedArchive(null);
          }
        }
      }
    });
  };

  const handleView = (archive: CustomerArchive) => {
    setSelectedArchive(archive);
  };

  const handleCloseDetail = () => {
    setSelectedArchive(null);
  };

  const handleSaveCurrent = () => {
    if (!currentFoot) {
      Taro.showToast({ title: '请先录入脚型数据', icon: 'none' });
      return;
    }
    const fitResult = currentFitResult || performLastFit(currentFoot);
    const newArchive: CustomerArchive = {
      id: generateId(),
      customerName: currentFoot.customerName,
      phone: '',
      footMeasurements: [currentFoot],
      lastFitResults: [fitResult],
      riskWarnings: fitResult.riskWarnings,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    useShoeStore.getState().addArchive(newArchive);
    Taro.showToast({ title: '档案已保存', icon: 'success' });
  };

  const getWarningTagClass = (severity: string) => {
    if (severity === 'high') return styles.warningTagHigh;
    if (severity === 'medium') return styles.warningTagMedium;
    return styles.warningTagLow;
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>定制档案</Text>
        <Text className={styles.headerCount}>共 {archives.length} 位客户</Text>
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder='搜索客户姓名或手机号'
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
        />
      </View>

      {filteredArchives.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>
            {searchText ? '未找到匹配的客户' : '暂无客户档案'}
          </Text>
        </View>
      ) : (
        <ScrollView scrollY className={styles.archiveList}>
          {filteredArchives.map((archive) => {
            const latestFoot = archive.footMeasurements[0];
            return (
              <View key={archive.id} className={styles.archiveCard}>
                <View className={styles.archiveHeader}>
                  <Text className={styles.archiveName}>{archive.customerName}</Text>
                  <Text className={styles.archiveDate}>{archive.updatedAt}</Text>
                </View>
                <View className={styles.archiveBody}>
                  <View className={styles.archiveRow}>
                    <Text className={styles.archiveLabel}>脚长</Text>
                    <Text className={styles.archiveValue}>{latestFoot?.footLength || '-'}mm</Text>
                  </View>
                  <View className={styles.archiveRow}>
                    <Text className={styles.archiveLabel}>跖围</Text>
                    <Text className={styles.archiveValue}>{latestFoot?.ballGirth || '-'}mm</Text>
                  </View>
                  <View className={styles.archiveRow}>
                    <Text className={styles.archiveLabel}>目标鞋款</Text>
                    <Text className={styles.archiveValue}>
                      {latestFoot ? SHOE_STYLE_LABELS[latestFoot.shoeStyle] : '-'}
                    </Text>
                  </View>
                  {archive.riskWarnings.length > 0 && (
                    <View className={styles.warningTags}>
                      {archive.riskWarnings.map((w, idx) => (
                        <Text key={idx} className={classnames(styles.warningTag, getWarningTagClass(w.severity))}>
                          {w.location}: {w.description.substring(0, 8)}...
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
                <View className={styles.archiveFooter}>
                  <Button className={classnames(styles.archiveBtn, styles.archiveBtnView)} onClick={() => handleView(archive)}>
                    查看详情
                  </Button>
                  <Button className={classnames(styles.archiveBtn, styles.archiveBtnDel)} onClick={() => handleDelete(archive.id)}>
                    删除
                  </Button>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {selectedArchive && (
        <View className={styles.detailModal} onClick={handleCloseDetail}>
          <View className={styles.detailContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.detailHandle} />
            <Text className={styles.detailTitle}>{selectedArchive.customerName} - 定制档案</Text>

            <View className={styles.detailSection}>
              <Text className={styles.detailSectionTitle}>脚型数据</Text>
              {selectedArchive.footMeasurements.map((foot, idx) => (
                <View key={idx}>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>脚长</Text>
                    <Text className={styles.detailValue}>{foot.footLength}mm</Text>
                  </View>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>跖围</Text>
                    <Text className={styles.detailValue}>{foot.ballGirth}mm</Text>
                  </View>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>脚背高度</Text>
                    <Text className={styles.detailValue}>{foot.instepHeight}mm</Text>
                  </View>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>脚跟宽度</Text>
                    <Text className={styles.detailValue}>{foot.heelWidth}mm</Text>
                  </View>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>趾型</Text>
                    <Text className={styles.detailValue}>{TOE_SHAPE_LABELS[foot.toeShape]}</Text>
                  </View>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>足弓</Text>
                    <Text className={styles.detailValue}>{ARCH_TYPE_LABELS[foot.archType]}</Text>
                  </View>
                  <View className={styles.detailRow}>
                    <Text className={styles.detailLabel}>目标鞋款</Text>
                    <Text className={styles.detailValue}>{SHOE_STYLE_LABELS[foot.shoeStyle]}</Text>
                  </View>
                </View>
              ))}
            </View>

            {selectedArchive.lastFitResults.length > 0 && (
              <View className={styles.detailSection}>
                <Text className={styles.detailSectionTitle}>楦型尺寸</Text>
                {selectedArchive.lastFitResults.map((fit, idx) => (
                  <View key={idx}>
                    <View className={styles.detailRow}>
                      <Text className={styles.detailLabel}>楦底长</Text>
                      <Text className={styles.detailValue}>{fit.lastDimensions.lastLength}mm</Text>
                    </View>
                    <View className={styles.detailRow}>
                      <Text className={styles.detailLabel}>楦跖围</Text>
                      <Text className={styles.detailValue}>{fit.lastDimensions.lastBallGirth}mm</Text>
                    </View>
                    <View className={styles.detailRow}>
                      <Text className={styles.detailLabel}>楦背围</Text>
                      <Text className={styles.detailValue}>{fit.lastDimensions.lastInstepGirth}mm</Text>
                    </View>
                    <View className={styles.detailRow}>
                      <Text className={styles.detailLabel}>鞋码</Text>
                      <Text className={styles.detailValue}>{fit.lastDimensions.shoeSize}码</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {selectedArchive.riskWarnings.length > 0 && (
              <View className={styles.detailSection}>
                <Text className={styles.detailSectionTitle}>风险预警记录</Text>
                {selectedArchive.riskWarnings.map((w, idx) => (
                  <View key={idx} className={styles.detailWarning}>
                    <Text className={styles.detailWarningText}>{w.location} - {w.description}</Text>
                    <Text className={styles.detailWarningSuggestion}>建议：{w.suggestion}</Text>
                  </View>
                ))}
              </View>
            )}

            <Button className={styles.detailClose} onClick={handleCloseDetail}>
              关闭
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default ArchivePage;

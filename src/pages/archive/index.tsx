import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, Input, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useShoeStore, generateId } from '@/store/useShoeStore';
import type { CustomerArchive } from '@/types/shoe';
import { SHOE_STYLE_LABELS, TOE_SHAPE_LABELS, ARCH_TYPE_LABELS } from '@/types/shoe';
import { performLastFit } from '@/utils/shoeCalculations';
import styles from './index.module.scss';

const ArchivePage: React.FC = () => {
  const { archives, deleteArchive, updateArchive, currentFoot, currentFitResult,
    lastSavedArchiveId, clearLastSavedArchiveId, saveOrUpdateArchive } = useShoeStore();
  const [searchText, setSearchText] = useState('');
  const [selectedArchive, setSelectedArchive] = useState<CustomerArchive | null>(null);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    if (lastSavedArchiveId && !autoOpenedRef.current) {
      const archive = archives.find(a => a.id === lastSavedArchiveId);
      if (archive) {
        console.info('[Archive] 自动打开刚保存的档案:', archive.customerName);
        setSelectedArchive(archive);
        autoOpenedRef.current = true;
        setTimeout(() => {
          clearLastSavedArchiveId();
        }, 500);
      }
    }
  }, [lastSavedArchiveId, archives, clearLastSavedArchiveId]);

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
    autoOpenedRef.current = true;
    setSelectedArchive(archive);
  };

  const handleCloseDetail = () => {
    setSelectedArchive(null);
    autoOpenedRef.current = true;
  };

  const handleSaveCurrent = () => {
    if (!currentFoot) {
      Taro.showToast({ title: '请先录入脚型数据', icon: 'none' });
      return;
    }
    const fitResult = currentFitResult || performLastFit(currentFoot);
    const archive = saveOrUpdateArchive(currentFoot, fitResult);
    autoOpenedRef.current = false;
    setSelectedArchive(archive);
  };

  const getWarningTagClass = (severity: string) => {
    if (severity === 'high') return styles.warningTagHigh;
    if (severity === 'medium') return styles.warningTagMedium;
    return styles.warningTagLow;
  };

  const buildTimeline = (archive: CustomerArchive) => {
    const events: {
      date: string;
      foot: typeof archive.footMeasurements[number] | null;
      fit: typeof archive.lastFitResults[number] | null;
      warnings: typeof archive.riskWarnings;
    }[] = [];

    const maxLen = Math.max(archive.footMeasurements.length, archive.lastFitResults.length);
    for (let i = 0; i < maxLen; i++) {
      const foot = archive.footMeasurements[i] || null;
      const fit = archive.lastFitResults[i] || null;
      const date = foot?.createdAt || fit ? archive.updatedAt : archive.createdAt;
      const warnings = i === 0 ? archive.riskWarnings : [];
      events.push({ date, foot, fit, warnings });
    }
    return events;
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
        <ScrollView scrollY className={styles.archiveList} scrollWithAnimation>
          {filteredArchives.map((archive) => {
            const latestFoot = archive.footMeasurements[0];
            const isJustSaved = archive.id === lastSavedArchiveId;
            return (
              <View
                key={archive.id}
                className={classnames(styles.archiveCard, isJustSaved && styles.archiveCardHighlight)}
                onClick={() => handleView(archive)}
              >
                <View className={styles.archiveHeader}>
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <Text className={styles.archiveName}>{archive.customerName}</Text>
                    {isJustSaved && <Text className={styles.newBadge}>新</Text>}
                  </View>
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
                  <View className={styles.archiveRow}>
                    <Text className={styles.archiveLabel}>录入记录</Text>
                    <Text className={styles.archiveValue}>
                      {archive.footMeasurements.length} 次脚型
                    </Text>
                  </View>
                  {archive.riskWarnings.length > 0 && (
                    <View className={styles.warningTags}>
                      {archive.riskWarnings.slice(0, 3).map((w, idx) => (
                        <Text key={idx} className={classnames(styles.warningTag, getWarningTagClass(w.severity))}>
                          {w.location}
                        </Text>
                      ))}
                      {archive.riskWarnings.length > 3 && (
                        <Text className={classnames(styles.warningTag, styles.warningTagLow)}>
                          +{archive.riskWarnings.length - 3}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                <View className={styles.archiveFooter}>
                  <Button className={classnames(styles.archiveBtn, styles.archiveBtnView)} onClick={(e) => { e.stopPropagation(); handleView(archive); }}>
                    查看时间线
                  </Button>
                  <Button className={classnames(styles.archiveBtn, styles.archiveBtnDel)} onClick={(e) => { e.stopPropagation(); handleDelete(archive.id); }}>
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
            <Text className={styles.detailTitle}>{selectedArchive.customerName} - 方案时间线</Text>
            <View className={styles.detailSection}>
              <Text className={styles.detailSectionTitle}>客户信息</Text>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>首次建档</Text>
                <Text className={styles.detailValue}>{selectedArchive.createdAt}</Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>最近更新</Text>
                <Text className={styles.detailValue}>{selectedArchive.updatedAt}</Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>脚型记录</Text>
                <Text className={styles.detailValue}>{selectedArchive.footMeasurements.length} 次</Text>
              </View>
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>楦型记录</Text>
                <Text className={styles.detailValue}>{selectedArchive.lastFitResults.length} 次</Text>
              </View>
            </View>

            <View className={styles.detailSection}>
              <Text className={styles.detailSectionTitle}>方案时间线</Text>
              <View className={styles.timeline}>
                {buildTimeline(selectedArchive).map((event, idx) => (
                  <View key={idx} className={styles.timelineItem}>
                    <View className={styles.timelineDot} />
                    <View className={styles.timelineHeader}>
                      <Text className={styles.timelineDate}>{event.date}</Text>
                      <Text className={styles.timelineBadge}>
                        第 {selectedArchive.footMeasurements.length - idx} 次
                      </Text>
                    </View>

                    {event.foot && (
                      <View className={styles.timelineSection}>
                        <Text className={styles.timelineSectionTitle}>🦶 脚型数据</Text>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>脚长</Text>
                          <Text className={styles.timelineValue}>{event.foot.footLength}mm</Text>
                        </View>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>跖围</Text>
                          <Text className={styles.timelineValue}>{event.foot.ballGirth}mm</Text>
                        </View>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>脚背高度</Text>
                          <Text className={styles.timelineValue}>{event.foot.instepHeight}mm</Text>
                        </View>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>趾型</Text>
                          <Text className={styles.timelineValue}>{TOE_SHAPE_LABELS[event.foot.toeShape]}</Text>
                        </View>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>足弓</Text>
                          <Text className={styles.timelineValue}>{ARCH_TYPE_LABELS[event.foot.archType]}</Text>
                        </View>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>目标鞋款</Text>
                          <Text className={styles.timelineValue}>{SHOE_STYLE_LABELS[event.foot.shoeStyle]}</Text>
                        </View>
                        {event.foot.notes && (
                          <Text className={styles.timelineNote}>备注：{event.foot.notes}</Text>
                        )}
                      </View>
                    )}

                    {event.fit && (
                      <View className={styles.timelineSection}>
                        <Text className={styles.timelineSectionTitle}>📐 楦型尺寸</Text>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>楦底长</Text>
                          <Text className={styles.timelineValue}>{event.fit.lastDimensions.lastLength}mm</Text>
                        </View>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>楦跖围</Text>
                          <Text className={styles.timelineValue}>{event.fit.lastDimensions.lastBallGirth}mm</Text>
                        </View>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>楦背围</Text>
                          <Text className={styles.timelineValue}>{event.fit.lastDimensions.lastInstepGirth}mm</Text>
                        </View>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>楦宽</Text>
                          <Text className={styles.timelineValue}>{event.fit.lastDimensions.lastWidth}mm</Text>
                        </View>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>前跷 / 后跷</Text>
                          <Text className={styles.timelineValue}>
                            {event.fit.lastDimensions.toeSpring} / {event.fit.lastDimensions.heelSpring}mm
                          </Text>
                        </View>
                        <View className={styles.timelineRow}>
                          <Text className={styles.timelineLabel}>鞋码</Text>
                          <Text className={styles.timelineValue}>{event.fit.lastDimensions.shoeSize}码</Text>
                        </View>
                      </View>
                    )}

                    {event.warnings && event.warnings.length > 0 && (
                      <View>
                        <Text className={styles.timelineSectionTitle}>⚠️ 风险预警</Text>
                        {event.warnings.map((w, wi) => (
                          <View key={wi} className={styles.timelineWarning}>
                            <Text className={styles.timelineWarningText}>
                              {w.location} - {w.description}
                            </Text>
                            <Text className={styles.detailWarningSuggestion}>
                              建议：{w.suggestion}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

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

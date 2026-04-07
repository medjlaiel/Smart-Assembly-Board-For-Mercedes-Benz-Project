/**
 * DateRangePicker.js
 * A modal date range picker with calendar UI (Skyscanner-style)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DateRangePicker({ visible, onClose, onApply, initialStartDate, initialEndDate }) {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [tempStart, setTempStart] = useState(initialStartDate);
  const [tempEnd, setTempEnd] = useState(initialEndDate);

  // Reset temp dates when dialog opens
  useEffect(() => {
    if (visible) {
      setTempStart(initialStartDate);
      setTempEnd(initialEndDate);
    }
  }, [visible, initialStartDate, initialEndDate]);

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;

    if (!tempStart || (tempStart && tempEnd)) {
      // Start new selection
      setTempStart(selectedDate);
      setTempEnd(null);
    } else if (tempStart && !tempEnd) {
      // Complete the range
      if (selectedDate < tempStart) {
        // If selected date is before start, set it as start and previous start as end
        setTempEnd(tempStart);
        setTempStart(selectedDate);
      } else {
        setTempEnd(selectedDate);
      }
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};

    if (tempStart) {
      marked[tempStart] = {
        startingDay: true,
        color: COLORS.primary + '40',
        textColor: COLORS.primary,
      };
    }

    if (tempEnd) {
      marked[tempEnd] = {
        endingDay: true,
        color: COLORS.primary + '40',
        textColor: COLORS.primary,
      };
    }

    // Mark days in between
    if (tempStart && tempEnd) {
      const start = new Date(tempStart);
      const end = new Date(tempEnd);
      let current = new Date(start);
      while (current < end) {
        current.setDate(current.getDate() + 1);
        const dateStr = current.toISOString().split('T')[0];
        if (dateStr !== tempEnd) {
          marked[dateStr] = {
            color: COLORS.primary + '20',
            textColor: COLORS.text,
          };
        }
      }
    }

    return marked;
  };

  const handleApply = () => {
    if (tempStart && tempEnd) {
      setStartDate(tempStart);
      setEndDate(tempEnd);
      onApply({ start: tempStart, end: tempEnd });
    }
    onClose();
  };

  const handleCancel = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    onClose();
  };

  const handleReset = () => {
    setTempStart(null);
    setTempEnd(null);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('history.dateRange')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={24} color={COLORS.text3} />
            </TouchableOpacity>
          </View>

          {/* Selected Range Display */}
          {(tempStart || tempEnd) && (
            <View style={styles.rangeDisplay}>
              <Icon name="event" size={16} color={COLORS.primary} />
              <Text style={styles.rangeText}>
                {tempStart && formatDisplayDate(tempStart)}
                {tempStart && tempEnd && " – "}
                {tempEnd && formatDisplayDate(tempEnd)}
              </Text>
              {(tempStart || tempEnd) && (
                <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                  <Icon name="refresh" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <CalendarList
              onDayPress={handleDayPress}
              markedDates={getMarkedDates()}
              markingType={'custom'}
              theme={{
                backgroundColor: COLORS.background,
                calendarBackground: COLORS.background,
                textSectionTitleColor: COLORS.text3,
                selectedDayBackgroundColor: COLORS.primary,
                selectedDayTextColor: COLORS.white,
                todayTextColor: COLORS.primary,
                dayTextColor: COLORS.text,
                textDisabledColor: COLORS.text3,
                monthTextColor: COLORS.text,
                arrowColor: COLORS.primary,
              }}
              firstDay={1}
              hideExtraDays={true}
              showScrollIndicator={false}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.applyBtn,
                (!tempStart || !tempEnd) && styles.disabledBtn
              ]}
              onPress={handleApply}
              disabled={!tempStart || !tempEnd}
            >
              <Text style={styles.applyBtnText}>{t('common.apply')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dialog: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: SCREEN_HEIGHT * 0.85,
    ...SHADOW.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  rangeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '60',
  },
  rangeText: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
  },
  calendarContainer: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    fontSize: FONT_SIZES.button,
    fontWeight: '600',
    color: COLORS.text2,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
  },
  applyBtnText: {
    fontSize: FONT_SIZES.button,
    fontWeight: '600',
    color: COLORS.white,
  },
  disabledBtn: {
    backgroundColor: COLORS.text3 + '30',
  },
});
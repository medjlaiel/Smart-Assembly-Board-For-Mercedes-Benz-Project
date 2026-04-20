/**
 * UploadXlsxScreen.js
 * Screen for uploading and viewing XLSX files
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { Table, Row, Rows } from 'react-native-table-component';

export default function UploadXlsxScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setLoading(true);
        const fileUri = result.uri;

        // Read the file as base64
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Parse XLSX
        const workbook = XLSX.read(fileContent, { type: 'base64' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        setData(jsonData);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick or read the XLSX file.');
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (!data || data.length === 0) return null;

    const tableHead = data[0];
    const tableData = data.slice(1);

    return (
      <View style={styles.tableContainer}>
        <Table borderStyle={{ borderWidth: 2, borderColor: COLORS.primary }}>
          <Row
            data={tableHead}
            style={styles.head}
            textStyle={styles.headText}
            widthArr={tableHead.map(() => 100)} // Adjust width as needed
          />
          <Rows
            data={tableData}
            textStyle={styles.text}
            widthArr={tableHead.map(() => 100)}
          />
        </Table>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Upload XLSX File</Text>
          <Text style={styles.subtitle}>
            Select an XLSX file to view its contents
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.uploadButton, SHADOW.small]}
          onPress={pickDocument}
          disabled={loading}
        >
          <Icon name="file-upload" size={24} color={COLORS.white} />
          <Text style={styles.uploadButtonText}>
            {loading ? 'Loading...' : 'Choose XLSX File'}
          </Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Reading file...</Text>
          </View>
        )}

        {data && !loading && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>File Contents:</Text>
            {renderTable()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text2,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: RADIUS.medium,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: FONT_SIZES.medium,
    color: COLORS.text2,
  },
  dataContainer: {
    marginTop: 20,
  },
  dataTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text1,
    marginBottom: 10,
  },
  tableContainer: {
    flex: 1,
  },
  head: {
    height: 40,
    backgroundColor: COLORS.primary,
  },
  headText: {
    fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.white,
  },
  text: {
    fontSize: FONT_SIZES.small,
    textAlign: 'center',
    color: COLORS.text1,
  },
});
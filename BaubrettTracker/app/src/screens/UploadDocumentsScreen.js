/**
 * UploadXlsxScreen.js
 * Screen for uploading, storing, and viewing XLSX files
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import XLSX from 'xlsx';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Table, Row, Rows } from 'react-native-table-component';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const STORAGE_KEY = 'uploaded_xlsx_files';

export default function UploadXlsxScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storedFiles, setStoredFiles] = useState([]);
  const [viewingFile, setViewingFile] = useState(null);

  // Load stored files on component mount
  useEffect(() => {
    loadStoredFiles();
  }, []);

  // Reload files whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStoredFiles();
    }, [])
  );

  const loadStoredFiles = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const files = JSON.parse(stored);
        // Sort by upload date, newest first
        const sortedFiles = files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        setStoredFiles(sortedFiles);
      }
    } catch (error) {
      console.error('Error loading stored files:', error);
    }
  };

  const saveFileToStorage = async (fileName, fileBase64, fileType) => {
    try {
      const fileEntry = {
        id: Date.now().toString(),
        name: fileName,
        content: fileBase64,
        type: fileType,
        uploadedAt: new Date().toISOString(),
      };

      const updatedFiles = [...storedFiles, fileEntry];
      // Sort by upload date, newest first
      const sortedFiles = updatedFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sortedFiles));
      setStoredFiles(sortedFiles);

      Alert.alert('Success', 'File uploaded and saved successfully!');
      return fileEntry;
    } catch (error) {
      console.error('Error saving file:', error);
      Alert.alert('Error', 'Failed to save the file.');
      return null;
    }
  };

  const deleteFile = async (fileId) => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedFiles = storedFiles.filter(file => file.id !== fileId);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
              setStoredFiles(updatedFiles);

              if (viewingFile && viewingFile.id === fileId) {
                setViewingFile(null);
                setData(null);
              }

              Alert.alert('Success', 'File deleted successfully!');
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Error', 'Failed to delete the file.');
            }
          },
        },
      ]
    );
  };

  const parseXlsxBase64 = (base64) => {
    const workbook = XLSX.read(base64, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
          'application/pdf', // PDF
        ],
        copyToCacheDirectory: true,
      });

      // Check if user cancelled or if document was picked (handle both old and new API)
      if (result.canceled === true || (result.type && result.type !== 'success')) {
        return;
      }

      // Get file info (handle both old and new API)
      let fileUri, fileName, fileType;
      if (result.assets && result.assets.length > 0) {
        // New API structure
        fileUri = result.assets[0].uri;
        fileName = result.assets[0].name || 'Unnamed File';
        fileType = result.assets[0].mimeType || 'application/octet-stream';
      } else if (result.uri) {
        // Old API structure
        fileUri = result.uri;
        fileName = result.name || 'Unnamed File';
        fileType = result.mimeType || 'application/octet-stream';
      } else {
        Alert.alert('Error', 'Could not read file information.');
        return;
      }

      setLoading(true);

      // Read the file as base64
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      let parsedData = null;
      if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // Parse XLSX
        try {
          parsedData = parseXlsxBase64(fileContent);
        } catch (parseError) {
          console.error('Error parsing XLSX:', parseError);
        }
      } else if (fileType === 'application/pdf') {
        // For PDF, we store the content but don't parse it
        parsedData = null; // PDFs don't have tabular data
      }

      setData(parsedData);
      setViewingFile(null); // Clear viewing file when uploading new one

      // Save raw file content to storage
      const savedFile = await saveFileToStorage(fileName, fileContent, fileType);
      if (savedFile) {
        setViewingFile(savedFile);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick or read the file.');
      setLoading(false);
    }
  };

  const openStoredFile = async (file) => {
    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // For XLSX files, parse and display as table
        const jsonData = parseXlsxBase64(file.content);
        setData(jsonData);
        setViewingFile(file);
      } else if (file.type === 'application/pdf') {
        // For PDF files, save temporarily and open with system viewer
        const tempFileUri = `${FileSystem.cacheDirectory}${file.name}`;
        await FileSystem.writeAsStringAsync(tempFileUri, file.content, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempFileUri, {
            mimeType: 'application/pdf',
            dialogTitle: `Open ${file.name}`,
          });
        } else {
          Alert.alert('Error', 'Sharing is not available on this device.');
        }
      }
    } catch (error) {
      console.error('Error opening stored file:', error);
      Alert.alert('Error', 'Failed to open the file.');
    }
  };

  const renderFileItem = ({ item }) => {
    const isNew = (new Date() - new Date(item.uploadedAt)) < 5 * 60 * 1000; // 5 minutes
    const isXlsx = item.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const isPdf = item.type === 'application/pdf';

    return (
      <View style={[styles.fileItem, SHADOW.small]}>
        <TouchableOpacity
          style={styles.fileContent}
          onPress={() => openStoredFile(item)}
        >
          <View style={styles.fileIcon}>
            <Icon
              name={isXlsx ? "table-chart" : isPdf ? "picture-as-pdf" : "description"}
              size={24}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.fileInfo}>
            <View style={styles.fileNameRow}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.name}
              </Text>
              {isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
            <Text style={styles.fileDate}>
              {new Date(item.uploadedAt).toLocaleDateString()}
            </Text>
            <Text style={styles.fileType}>
              {isXlsx ? 'Spreadsheet' : isPdf ? 'PDF Document' : 'File'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteFile(item.id)}
        >
          <Icon name="delete" size={20} color={COLORS.error || '#F44336'} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTable = () => {
    if (!data || data.length === 0) return null;

    const tableHead = data[0];
    const tableData = data.slice(1);

    return (
      <View style={styles.tableContainer}>
        {viewingFile && (
          <View style={styles.viewingHeader}>
            <Text style={styles.viewingTitle}>Viewing: {viewingFile.name}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setViewingFile(null);
                setData(null);
              }}
            >
              <Icon name="close" size={20} color={COLORS.text2} />
            </TouchableOpacity>
          </View>
        )}
        <Table borderStyle={{ borderWidth: 2, borderColor: COLORS.primary }}>
          <Row
            data={tableHead}
            style={styles.head}
            textStyle={styles.headText}
            widthArr={tableHead.map(() => 100)}
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
          <Text style={styles.title}>Document Files</Text>
          <Text style={styles.subtitle}>
            Upload and manage your XLSX and PDF files
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.uploadButton, SHADOW.small]}
          onPress={pickDocument}
          disabled={loading}
        >
          <Icon name="file-upload" size={24} color={COLORS.white} />
          <Text style={styles.uploadButtonText}>
            {loading ? 'Uploading...' : 'Upload XLSX or PDF File'}
          </Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Processing file...</Text>
          </View>
        )}

        {storedFiles.length > 0 && (
          <View style={styles.filesSection}>
            <Text style={styles.sectionTitle}>Your Files ({storedFiles.length})</Text>
            <FlatList
              data={storedFiles}
              keyExtractor={(item) => item.id}
              renderItem={renderFileItem}
              scrollEnabled={false}
              style={styles.filesList}
            />
          </View>
        )}

        {data && !loading && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>
              {viewingFile ? `Viewing: ${viewingFile.name}` : 'File Contents'}
            </Text>
            {renderTable()}
          </View>
        )}

        {storedFiles.length === 0 && !loading && !data && (
          <View style={styles.emptyState}>
            <Icon name="folder-open" size={48} color={COLORS.text3} />
            <Text style={styles.emptyText}>No files uploaded yet</Text>
            <Text style={styles.emptySubtext}>Upload your first XLSX file to get started</Text>
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
  filesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text1,
    marginBottom: 10,
  },
  filesList: {
    marginBottom: 20,
  },
  fileItem: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.medium,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  fileContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  fileName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
    color: COLORS.text1,
    flex: 1,
  },
  newBadge: {
    backgroundColor: COLORS.accent || '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.small,
    marginLeft: 8,
  },
  newBadgeText: {
    fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  fileDate: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text3,
  },
  fileType: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text2,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
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
  viewingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewingTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.primary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
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
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: FONT_SIZES.large,
    fontWeight: '500',
    color: COLORS.text2,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text3,
    textAlign: 'center',
  },
});
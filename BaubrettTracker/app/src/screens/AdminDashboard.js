/**
 * AdminDashboard.js
 * Admin panel for managing the product database across 4 categories:
 * BB-NB, SOM, Accessories, and FP-NO
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, FONT_SIZES, RADIUS, SHADOW } from '../assets/theme';
import { getAll } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
  { id: 'bb_nb', label: 'BB-NB', key: 'BB_Nb' },
  { id: 'som', label: 'SOM', key: 'SOM' },
  { id: 'accessories', label: 'Accessories', key: 'Accessories' },
  { id: 'fp_no', label: 'FP-NO', key: 'FP_NO' },
];

export default function AdminDashboard({ navigation }) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('bb_nb');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});

  // Route protection: redirect non-admin users to login
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have permission to access this page.');
      navigation.replace('Login');
    }
  }, [currentUser, navigation]);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = useCallback(() => {
    setLoading(true);
    try {
      const products = getAll();
      setAllProducts(products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get products for active category
  const getProductsForCategory = useCallback(() => {
    const category = CATEGORIES.find(c => c.id === activeCategory);
    if (!category) return [];

    const key = category.key;
    
    if (activeCategory === 'accessories') {
      // For accessories, need to handle array of accessories from each product
      const accessorySet = new Set();
      allProducts.forEach(product => {
        if (product.Accessories && Array.isArray(product.Accessories)) {
          product.Accessories.forEach(acc => accessorySet.add(acc));
        }
      });
      return Array.from(accessorySet).map((acc, idx) => ({
        id: `acc_${idx}`,
        name: acc,
        sourceCount: allProducts.filter(p => p.Accessories?.includes(acc)).length,
      }));
    }

    if (activeCategory === 'fp_no') {
      // For FP-NO, extract each value from arrays as individual entries
      const fpNoSet = new Set();
      allProducts.forEach(product => {
        if (product.FP_NO && Array.isArray(product.FP_NO)) {
          product.FP_NO.forEach(fp => {
            fpNoSet.add(String(fp).trim());
          });
        }
      });
      return Array.from(fpNoSet).map((fpNo, idx) => ({
        id: `fpno_${idx}`,
        FP_NO: fpNo,
        name: fpNo,
        sourceCount: allProducts.filter(p => 
          p.FP_NO && Array.isArray(p.FP_NO) && 
          p.FP_NO.some(fp => String(fp).trim() === fpNo)
        ).length,
      }));
    }

    // For BB_Nb and SOM, collect unique values
    const productMap = new Map();
    allProducts.forEach(product => {
      const value = product[key];
      
      if (value) {
        const strValue = String(value).trim();
        if (!productMap.has(strValue)) {
          productMap.set(strValue, { 
            [key]: value, 
            BB_Nb: product.BB_Nb,
            id: `${activeCategory}_${strValue}`,
          });
        }
      }
    });

    return Array.from(productMap.values());
  }, [activeCategory, allProducts]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setShowModal(true);
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            // Remove from allProducts
            const updatedProducts = allProducts.filter(
              p => p.BB_Nb !== product.BB_Nb
            );
            setAllProducts(updatedProducts);
            Alert.alert('Success', 'Product deleted successfully');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSaveProduct = () => {
    if (!formData.BB_Nb || !formData.BB_Nb.trim()) {
      Alert.alert('Error', 'BB_Nb is required');
      return;
    }

    let productToSave = { ...formData };

    // For FP_NO tab, extract the single value from form
    if (activeCategory === 'fp_no') {
      if (!productToSave.FP_NO || !productToSave.FP_NO.trim()) {
        Alert.alert('Error', 'FP_NO is required');
        return;
      }
      // Keep FP_NO as string for single entry, will be added to products array
    } else if (activeCategory === 'accessories') {
      // Handle accessories array (comma-separated input)
      if (productToSave.Accessories && typeof productToSave.Accessories === 'string') {
        productToSave.Accessories = productToSave.Accessories
          .split(',')
          .map(acc => acc.trim())
          .filter(acc => acc.length > 0);
      }
    } else if (activeCategory === 'fp_no_full') {
      // Handle FP_NO array (comma-separated input for BB_Nb)
      if (productToSave.FP_NO && typeof productToSave.FP_NO === 'string') {
        productToSave.FP_NO = productToSave.FP_NO
          .split(',')
          .map(fp => fp.trim())
          .filter(fp => fp.length > 0);
      }
    }

    if (editingProduct) {
      // Update existing
      const updatedProducts = allProducts.map(p =>
        p.BB_Nb === editingProduct.BB_Nb ? { ...p, ...productToSave } : p
      );
      setAllProducts(updatedProducts);
    } else {
      // For new products, just add them
      setAllProducts([...allProducts, productToSave]);
    }

    setShowModal(false);
    Alert.alert('Success', editingProduct ? 'Product updated' : 'Product added');
  };

  const categoryProducts = getProductsForCategory();
  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tab,
                activeCategory === category.id && styles.tabActive,
              ]}
              onPress={() => setActiveCategory(category.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeCategory === category.id && styles.tabTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        {/* Add Button */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddProduct}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+ Add {currentCategory?.label}</Text>
          </TouchableOpacity>
        </View>

        {/* Products List */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
          </View>
        ) : categoryProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No products found</Text>
          </View>
        ) : (
          <View>
            {categoryProducts.map((item, idx) => (
              <View key={item.id || `product_${idx}`} style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {activeCategory === 'fp_no' ? item.FP_NO : 
                     activeCategory === 'som' ? item.SOM : 
                     activeCategory === 'accessories' ? item.name : 
                     item.BB_Nb}
                  </Text>
                  {item.sourceCount && (
                    <Text style={styles.productMeta}>
                      Used in {item.sourceCount} product(s)
                    </Text>
                  )}
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleEditProduct(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteProduct(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? `Edit ${CATEGORIES.find(c => c.id === activeCategory)?.label}` : `Add ${CATEGORIES.find(c => c.id === activeCategory)?.label}`}
            </Text>

            {/* Form Fields */}
            <ScrollView style={styles.formScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>BB_Nb *</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.BB_Nb || '')}
                  onChangeText={(text) =>
                    setFormData({ ...formData, BB_Nb: text })
                  }
                  placeholder="Enter BB_Nb"
                  editable={!editingProduct}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>SOM</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.SOM || '')}
                  onChangeText={(text) =>
                    setFormData({ ...formData, SOM: text })
                  }
                  placeholder="Enter SOM"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>FP_NO</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.FP_NO || '')}
                  onChangeText={(text) =>
                    setFormData({ ...formData, FP_NO: text })
                  }
                  placeholder="Enter FP_NO (comma-separated for multiple)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Accessories</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.Accessories || '')}
                  onChangeText={(text) =>
                    setFormData({ ...formData, Accessories: text })
                  }
                  placeholder="Enter accessories (comma-separated)"
                  multiline
                />
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProduct}
                activeOpacity={0.7}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    ...SHADOW.small,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 0,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.label,
    fontWeight: '600',
    color: COLORS.text2,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionBar: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    ...SHADOW.small,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZES.label,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text2,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  productMeta: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text2,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 18,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: '#FF5252' + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    ...SHADOW.large,
  },
  modalTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  formScroll: {
    maxHeight: 350,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: FONT_SIZES.label,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.text2,
  },
  cancelBtnText: {
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.text2,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  saveBtnText: {
    textAlign: 'center',
    fontWeight: '600',
    color: COLORS.white,
  },
});

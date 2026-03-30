/**
 * QRScannerView.js
 * Reusable full-screen QR / barcode scanner built on expo-camera.
 *
 * Props:
 *   onScan(data: string) — called once with the decoded QR string
 *   hint: string         — instruction text shown below the viewfinder
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, RADIUS } from '../assets/theme';

const { width } = Dimensions.get('window');
const BOX_SIZE = width * 0.7;

// Delay (ms) before mounting the camera after the screen gains focus.
// This gives the previous screen's CameraView time to fully unmount
// and release the hardware camera.
const CAMERA_MOUNT_DELAY = 400;

export default function QRScannerView({ onScan, hint = 'Point the camera at a QR code' }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const cooldown = useRef(false);
  const isFocused = useIsFocused();

  // Request camera permission on mount if not yet determined
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // When the screen gains focus, wait a short delay before mounting the
  // CameraView. This ensures the previous screen's camera (still mounted
  // in the stack background) has been torn down and the hardware camera
  // is released. When the screen loses focus, immediately mark the camera
  // as not ready so it unmounts right away.
  useFocusEffect(
    useCallback(() => {
      // Screen focused — schedule camera mount
      const timer = setTimeout(() => {
        setCameraReady(true);
      }, CAMERA_MOUNT_DELAY);

      // Reset scan state for a fresh start
      cooldown.current = false;
      setScanned(false);

      return () => {
        // Screen blurred — immediately unmount camera & cancel pending timer
        clearTimeout(timer);
        setCameraReady(false);
      };
    }, [])
  );

  // Auto-reset cooldown after 3 seconds to recover from errors
  useEffect(() => {
    if (cooldown.current) {
      const timer = setTimeout(() => {
        cooldown.current = false;
        setScanned(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanned]);

  const handleBarcodeScanned = ({ data }) => {
    // Debounce — ignore rapid re-triggers
    if (scanned || cooldown.current) return;
    cooldown.current = true;
    setScanned(true);
    Vibration.vibrate(80); // Short haptic feedback
    onScan(data);
  };

  // ── Permission not yet decided ─────────────────────────────
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>Requesting camera permission…</Text>
      </View>
    );
  }

  // ── Permission denied ──────────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>📷</Text>
        <Text style={styles.errorTitle}>Camera Not Available</Text>
        <Text style={styles.infoText}>
          The camera is either not accessible or permissions were denied.
          {'\n\n'}
          If running in a web browser, please use the Expo Go app on your mobile device.
          If on mobile, please enable camera access in your device settings.
        </Text>
        {permission.canAskAgain && (
          <TouchableOpacity style={styles.retryBtn} onPress={requestPermission}>
            <Text style={styles.retryText}>Grant Permission</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Show a loading placeholder while waiting for the camera to be ready.
  // This covers both the "not focused" case and the brief delay after
  // gaining focus while the previous camera releases the hardware.
  const showCamera = isFocused && cameraReady;

  return (
    <View style={styles.container}>
      {showCamera ? (
        /* Camera fills the whole screen */
        <CameraView
          style={StyleSheet.absoluteFill}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
      ) : (
        /* Black placeholder with a spinner while camera initialises */
        <View style={[StyleSheet.absoluteFill, styles.cameraLoading]}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={styles.loadingText}>Starting camera…</Text>
        </View>
      )}

      {/* Dark overlay with a transparent cutout */}
      <View style={styles.overlay}>
        {/* Top dark strip */}
        <View style={styles.overlayTop} />

        <View style={styles.overlayMiddle}>
          {/* Left dark strip */}
          <View style={styles.overlayLeft} />

          {/* Viewfinder box */}
          <View style={styles.viewfinder}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* Right dark strip */}
          <View style={styles.overlayRight} />
        </View>

        {/* Bottom dark strip with hint text */}
        <View style={styles.overlayBottom}>
          <Text style={styles.hintText}>{hint}</Text>

          {scanned && (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setScanned(false);
                cooldown.current = false;
              }}
            >
              <Text style={styles.retryText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const OVERLAY_COLOR = 'rgba(0,0,0,0.60)';
const CORNER_SIZE = 28;
const CORNER_THICK = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraLoading: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 13,
    marginTop: 12,
    opacity: 0.7,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Overlay layout
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: OVERLAY_COLOR },
  overlayMiddle: { flexDirection: 'row', height: BOX_SIZE },
  overlayLeft: { flex: 1, backgroundColor: OVERLAY_COLOR },
  overlayRight: { flex: 1, backgroundColor: OVERLAY_COLOR },
  overlayBottom: {
    flex: 1.2,
    backgroundColor: OVERLAY_COLOR,
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 32,
  },

  // Viewfinder cutout
  viewfinder: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    backgroundColor: 'transparent',
  },

  // Corner bracket pieces
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: COLORS.white,
  },
  topLeft: {
    top: 0, left: 0,
    borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK,
    borderTopLeftRadius: RADIUS.sm,
  },
  topRight: {
    top: 0, right: 0,
    borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK,
    borderTopRightRadius: RADIUS.sm,
  },
  bottomLeft: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK,
    borderBottomLeftRadius: RADIUS.sm,
  },
  bottomRight: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK,
    borderBottomRightRadius: RADIUS.sm,
  },

  // Bottom text
  hintText: {
    color: COLORS.white,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: RADIUS.md,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});

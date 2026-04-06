/**
 * FaceCamera Component
 * 
 * Reusable camera component for capturing face images.
 * Uses expo-camera to access the device's front-facing camera.
 * Features a white mask overlay with an oval cutout for face positioning.
 * 
 * Props:
 *   onCapture(uri) — called with the photo URI after capture
 *   onCancel()     — called when the user cancels
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Path } from 'react-native-svg';

// Face guide dimensions
const GUIDE_WIDTH = 250;
const GUIDE_HEIGHT = 320;
const GUIDE_RADIUS = 125;

/**
 * Build an SVG path that fills a rectangle with a rounded-rect cutout.
 * Uses evenodd fill-rule so the inner shape becomes transparent.
 */
function buildMaskPath(viewW, viewH) {
  const cx = viewW / 2;
  const cy = viewH / 2;
  const x = cx - GUIDE_WIDTH / 2;
  const y = cy - GUIDE_HEIGHT / 2;
  const w = GUIDE_WIDTH;
  const h = GUIDE_HEIGHT;
  const r = GUIDE_RADIUS;

  // Outer rectangle (full screen)
  const outer = `M0,0 H${viewW} V${viewH} H0 Z`;

  // Inner rounded rect (pill/stadium shape)
  // r = half the width, so horizontal edges collapse — creates a vertical pill
  const inner = [
    `M${x + r},${y}`,
    `H${x + w - r}`,
    `A${r},${r} 0 0 1 ${x + w},${y + r}`,
    `V${y + h - r}`,
    `A${r},${r} 0 0 1 ${x + w - r},${y + h}`,
    `H${x + r}`,
    `A${r},${r} 0 0 1 ${x},${y + h - r}`,
    `V${y + r}`,
    `A${r},${r} 0 0 1 ${x + r},${y}`,
    'Z',
  ].join(' ');

  return `${outer} ${inner}`;
}

export default function FaceCamera({ onCapture, onCancel }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [overlayLayout, setOverlayLayout] = useState(null);
  const cameraRef = useRef(null);

  // Handle permission states
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera access is required for facial biometric authentication.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtnPermission} onPress={onCancel}>
          <Text style={styles.cancelBtnPermissionText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Capture a photo from the camera.
   * Saves as JPEG with 0.8 quality to balance file size and quality.
   */
  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      onCapture(photo.uri);
    } catch (error) {
      console.error('Failed to capture photo:', error);
      alert('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        {/* Face guide overlay with white mask */}
        <View
          style={styles.overlay}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setOverlayLayout({ width, height });
          }}
        >
          {/* White mask — covers everything except the oval cutout */}
          {overlayLayout && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg
                width={overlayLayout.width}
                height={overlayLayout.height}
              >
                <Path
                  d={buildMaskPath(overlayLayout.width, overlayLayout.height)}
                  fill="white"
                  fillRule="evenodd"
                />
              </Svg>
            </View>
          )}

          {/* Face guide border (rendered on top of mask) */}
          <View style={styles.faceGuide}>
            <Text style={styles.guideText}>Position your face here</Text>
          </View>
        </View>

        {/* Capture controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>

          <View style={{ width: 60 }} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: GUIDE_WIDTH,
    height: GUIDE_HEIGHT,
    borderRadius: GUIDE_RADIUS,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.8)',
    borderStyle: 'dashed',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  guideText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#00d4ff',
  },
  button: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#0a0a1a',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtnPermission: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
  },
  cancelBtnPermissionText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 40,
    lineHeight: 24,
  },
});

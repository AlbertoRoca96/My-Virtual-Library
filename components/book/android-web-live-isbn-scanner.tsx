import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import createElement from 'react-native-web/dist/exports/createElement';

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

type MediaTrackCapabilitiesWithFocus = MediaTrackCapabilities & {
  focusMode?: string[];
  torch?: boolean;
  zoom?: { min?: number; max?: number } | number;
};

type AndroidWebLiveIsbnScannerProps = {
  active: boolean;
  onDetected: (rawValue: string) => void;
  onDebug: (message: string) => void;
};

const DETECTION_INTERVAL_MS = 350;

export function AndroidWebLiveIsbnScanner({ active, onDetected, onDebug }: AndroidWebLiveIsbnScannerProps) {
  const onDetectedRef = useRef(onDetected);
  const onDebugRef = useRef(onDebug);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const intervalRef = useRef<number | null>(null);
  const detectedRef = useRef(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [supportsTorch, setSupportsTorch] = useState(false);

  const Video = useMemo(() => createElement('video', { ref: videoRef, autoPlay: true, playsInline: true, muted: true }), []);

  useEffect(() => {
    onDetectedRef.current = onDetected;
    onDebugRef.current = onDebug;
  }, [onDetected, onDebug]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      onDebugRef.current('window or navigator unavailable');
      return;
    }

    if (!active) {
      stopScanner();
      return;
    }

    const BarcodeDetectorClass = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!navigator.mediaDevices?.getUserMedia) {
      onDebugRef.current('getUserMedia is unavailable');
      return;
    }
    if (!BarcodeDetectorClass) {
      onDebugRef.current('BarcodeDetector is unavailable in this browser');
      return;
    }

    detectedRef.current = false;
    detectorRef.current = new BarcodeDetectorClass({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
    });

    let cancelled = false;

    async function startScanner() {
      try {
        onDebugRef.current('Requesting Android web camera stream');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (cancelled) {
          stopTracks(stream);
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          onDebugRef.current('Video element missing after getUserMedia');
          stopTracks(stream);
          return;
        }

        video.srcObject = stream;
        await video.play();
        setPreviewReady(true);
        onDebugRef.current('Android web camera preview ready');

        const [track] = stream.getVideoTracks();
        const capabilities = (track?.getCapabilities?.() ?? {}) as MediaTrackCapabilitiesWithFocus;
        setSupportsTorch(Boolean(capabilities.torch));

        const advancedConstraints: MediaTrackConstraintSet = {};
        if (Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes('continuous')) {
          advancedConstraints.focusMode = 'continuous';
        }
        if (typeof capabilities.zoom === 'object' && capabilities.zoom?.min !== undefined) {
          advancedConstraints.zoom = capabilities.zoom.min;
        }

        if (Object.keys(advancedConstraints).length > 0) {
          await track.applyConstraints({ advanced: [advancedConstraints] });
          onDebugRef.current(`Applied video track constraints: ${JSON.stringify(advancedConstraints)}`);
        } else {
          onDebugRef.current('No advanced focus constraints exposed by this browser/device');
        }

        intervalRef.current = window.setInterval(async () => {
          if (detectedRef.current || !videoRef.current || !detectorRef.current) {
            return;
          }

          const liveVideo = videoRef.current;
          if (liveVideo.readyState < 2) {
            return;
          }

          try {
            const results = await detectorRef.current.detect(liveVideo);
            const firstRawValue = results.find((result) => typeof result.rawValue === 'string' && result.rawValue.trim().length > 0)?.rawValue;
            if (!firstRawValue) {
              return;
            }

            detectedRef.current = true;
            onDebugRef.current(`BarcodeDetector found value: ${firstRawValue}`);
            onDetectedRef.current(firstRawValue);
          } catch (error) {
            onDebugRef.current(error instanceof Error ? error.message : 'BarcodeDetector failed during live scan');
          }
        }, DETECTION_INTERVAL_MS);
      } catch (error) {
        onDebugRef.current(error instanceof Error ? error.message : 'Failed to start Android web live scanner');
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [active]);

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (!track || !supportsTorch) {
      return;
    }

    const nextTorchEnabled = !torchEnabled;
    try {
      await track.applyConstraints({ advanced: [{ torch: nextTorchEnabled }] });
      setTorchEnabled(nextTorchEnabled);
      onDebugRef.current(`Torch ${nextTorchEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      onDebugRef.current(error instanceof Error ? error.message : 'Failed to toggle torch');
    }
  }

  function stopScanner() {
    detectedRef.current = false;
    setPreviewReady(false);
    setTorchEnabled(false);

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    if (streamRef.current) {
      stopTracks(streamRef.current);
      streamRef.current = null;
    }
  }

  return (
    <View className="gap-4">
      <Text className="text-sm leading-6 text-mist">
        Android web live scanner mode. Hold the barcode inside the frame and the form will autofill as soon as the first valid ISBN is detected. No photo ceremony required.
      </Text>

      <View className="h-[360px] overflow-hidden rounded-[28px] border border-line bg-night">
        <View className="absolute inset-0">{Video}</View>

        {previewReady ? (
          <View className="pointer-events-none absolute inset-0 items-center justify-center">
            <View className="h-[150px] w-[78%] rounded-[24px] border-2 border-parchment/90 bg-transparent" />
            <Text className="mt-4 rounded-full bg-black/40 px-4 py-2 text-xs text-parchment">
              First valid ISBN wins
            </Text>
          </View>
        ) : (
          <View className="absolute inset-0 items-center justify-center px-6">
            <Text className="text-center text-sm leading-6 text-parchment">
              Waiting for Android camera stream…
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row flex-wrap gap-3">
        <Pressable className="items-center rounded-full border border-line bg-paper px-5 py-3" onPress={stopScanner}>
          <Text className="text-base font-semibold text-ink">Pause scanner</Text>
        </Pressable>
        {supportsTorch ? (
          <Pressable className="items-center rounded-full border border-line bg-paper px-5 py-3" onPress={() => void toggleTorch()}>
            <Text className="text-base font-semibold text-ink">{torchEnabled ? 'Torch on' : 'Torch off'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function stopTracks(stream: MediaStream) {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

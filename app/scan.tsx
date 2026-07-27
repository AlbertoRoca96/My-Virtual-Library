import { zodResolver } from '@hookform/resolvers/zod';
import { CameraView, BarcodeScanningResult, BarcodeType, useCameraPermissions } from 'expo-camera';
import { ErrorBoundaryProps, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { AuthCard } from '@/features/auth/auth-card';
import { BookFormFields } from '@/features/books/book-form-fields';
import { BookFormValues, bookFormSchema, parseGenreString } from '@/features/books/book-form-schema';
import { sanitizeIsbn, isValidIsbnLength } from '@/features/books/isbn';
import { fetchBookDraftByIsbn } from '@/features/books/open-library';
import { useCreateBook } from '@/features/books/use-books';
import { useAuth } from '@/lib/auth';

const defaultValues: BookFormValues = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  description: '',
  readingStatus: 'owned',
  genres: '',
};

const barcodeTypes: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'];
const canAttemptCameraOnThisPlatform = Platform.OS === 'web';
const zoomPresets = [
  { label: '1x', value: 0 },
  { label: '1.5x', value: 0.15 },
  { label: '2x', value: 0.3 },
] as const;

function formatDebugValue(value: boolean | string | null | undefined) {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (value === null) {
    return 'null';
  }

  if (typeof value === 'undefined') {
    return 'undefined';
  }

  return String(value);
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24, gap: 24 }}>
      <View className="gap-4 rounded-[28px] border border-red-300 bg-red-50 p-6">
        <Text className="text-3xl text-red-900" style={{ fontFamily: 'Georgia' }}>
          Scan page crashed
        </Text>
        <Text className="text-base leading-7 text-red-900">
          Instead of a majestic blank white void, here is the actual error. Tiny progress. You can still use manual ISBN lookup after we fix this.
        </Text>
        <Text className="rounded-[20px] bg-white px-4 py-3 font-mono text-sm text-red-900">{error.message}</Text>
        <View className="gap-3 md:flex-row">
          <Button label="Try again" onPress={retry} />
        </View>
      </View>
    </ScrollView>
  );
}

export default function ScanScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const createBook = useCreateBook();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [cameraDebug, setCameraDebug] = useState('initializing');
  const [previewReady, setPreviewReady] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupPending, setLookupPending] = useState(false);
  const [lastScannedIsbn, setLastScannedIsbn] = useState('');
  const [zoom, setZoom] = useState(0.15);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const scanInFlightRef = useRef(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues,
  });

  useEffect(() => {
    let active = true;

    async function detectCameraAvailability() {
      try {
        const isAvailableAsync = (CameraView as typeof CameraView & { isAvailableAsync?: () => Promise<boolean> }).isAvailableAsync;

        if (typeof isAvailableAsync !== 'function') {
          if (active) {
            setCameraAvailable(null);
            setCameraDebug('CameraView.isAvailableAsync is not available in this runtime; allowing direct mount attempt');
          }
          return;
        }

        const available = await isAvailableAsync();
        if (active) {
          setCameraAvailable(available);
          setCameraDebug(`Camera availability check resolved: ${available ? 'true' : 'false'}`);
          if (!available) {
            setCameraError('This device or browser is not exposing a usable camera. Manual ISBN lookup still works below.');
          }
        }
      } catch (error) {
        if (active) {
          setCameraAvailable(canAttemptCameraOnThisPlatform ? null : false);
          setCameraDebug(error instanceof Error ? error.message : 'Unknown camera availability error');
          if (!canAttemptCameraOnThisPlatform) {
            setCameraError('This device or browser is not exposing a usable camera. Manual ISBN lookup still works below.');
          }
        }
      }
    }

    void detectCameraAvailability();

    return () => {
      active = false;
    };
  }, []);

  const permissionState = useMemo(() => {
    if (!permission) return 'unknown';
    if (permission.granted) return 'granted';
    return 'denied';
  }, [permission]);

  async function enableCamera() {
    setCameraError('');
    setLookupError('');
    setLookupMessage('');
    setPreviewReady(false);
    setTorchEnabled(false);
    scanInFlightRef.current = false;

    if (cameraAvailable === false && !canAttemptCameraOnThisPlatform) {
      setCameraError('No camera is available here. Use manual ISBN lookup below instead.');
      return;
    }

    try {
      setCameraDebug('Requesting camera permission');
      const result = await requestPermission();
      setCameraDebug(`Permission request resolved: granted=${result.granted ? 'true' : 'false'}`);
      if (!result.granted) {
        setCameraEnabled(false);
        setCameraError('Camera permission was denied. You can still paste an ISBN and lookup the book manually.');
        return;
      }

      setCameraEnabled(true);
      setCameraDebug('Permission granted; attempting to mount scanner');
    } catch (error) {
      setCameraEnabled(false);
      setCameraError(error instanceof Error ? error.message : 'Could not request camera permission.');
    }
  }

  async function hydrateFromIsbn(rawValue?: string) {
    if (lookupPending) {
      return;
    }

    const isbn = sanitizeIsbn(rawValue ?? getValues('isbn'));
    reset({ ...getValues(), isbn });

    if (!isValidIsbnLength(isbn)) {
      setLookupError('Use a 10 or 13 digit ISBN before lookup.');
      setLookupMessage('');
      return;
    }

    setLookupPending(true);
    setLookupError('');
    setLookupMessage('Looking up book data...');

    try {
      const draft = await fetchBookDraftByIsbn(isbn);
      if (!draft) {
        setLookupMessage('Nothing came back from Open Library. You can still fill the form manually.');
        reset({ ...getValues(), isbn });
        return;
      }

      reset({
        ...getValues(),
        ...draft,
        isbn,
      });
      setLookupMessage('Book data found. Edit anything you want before saving.');
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Lookup failed.');
      setLookupMessage('');
    } finally {
      setLookupPending(false);
    }
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (scanInFlightRef.current || lookupPending) {
      return;
    }

    scanInFlightRef.current = true;
    const isbn = sanitizeIsbn(result.data);
    if (!isValidIsbnLength(isbn)) {
      setLookupMessage('');
      setLookupError('Scanned code was not a usable ISBN. Try again, or type it manually like the civilized fallback it is.');
      scanInFlightRef.current = false;
      return;
    }

    setLastScannedIsbn(isbn);
    setLookupError('');
    setLookupMessage(`Scanned ${isbn}. Looking up book data...`);
    setCameraEnabled(false);
    void hydrateFromIsbn(isbn).finally(() => {
      scanInFlightRef.current = false;
    });
  }

  const onSubmit = (values: BookFormValues) => {
    createBook.mutate(
      {
        ...values,
        isbn: sanitizeIsbn(values.isbn),
        genres: parseGenreString(values.genres),
      },
      {
        onSuccess: () => {
          Alert.alert('Book saved', 'Scanned book added to your library.');
          router.push('/library');
        },
        onError: (error: Error) => {
          Alert.alert('Save failed', error.message);
        },
      }
    );
  };

  if (!user && !loading) {
    return (
      <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24 }}>
        <AuthCard />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24, gap: 24 }}>
      <View className="gap-3 rounded-[28px] border border-line bg-paper p-6">
        <Text className="text-3xl text-ink" style={{ fontFamily: 'Georgia' }}>
          Scan ISBN
        </Text>
        <Text className="text-base leading-7 text-mist">
          We ask for camera access first on every device. If scanning works, great. If the browser or phone behaves like a tiny goblin, manual ISBN lookup still lets you autofill and edit before saving.
        </Text>
      </View>

      <View className="gap-4 rounded-[28px] border border-line bg-paper p-5">
        {!cameraEnabled ? (
          <View className="gap-3 rounded-[24px] border border-dashed border-accent bg-[#EADFCF] p-5">
            <Text className="text-lg text-ink" style={{ fontFamily: 'Georgia' }}>
              Camera access needed
            </Text>
            <Text className="text-base leading-7 text-mist">
              Allow camera access to scan on Android or web. If that does not work on this device, manual ISBN lookup below will still do the job.
            </Text>
            <Button label="Allow camera" onPress={() => void enableCamera()} />
          </View>
        ) : null}

        {cameraEnabled && permissionState === 'granted' && (cameraAvailable !== false || canAttemptCameraOnThisPlatform) ? (
          <View className="gap-4">
            <Text className="text-sm leading-6 text-mist">
              Point the camera at the barcode on the back of the book and keep the lines inside the guide frame. Move a little farther back than feels natural, let autofocus settle, and use 1.5x or 2x zoom if the barcode is tiny.
            </Text>
            <View className="h-[360px] overflow-hidden rounded-[28px] border border-line bg-night">
              <CameraView
                style={{ flex: 1, width: '100%' }}
                facing="back"
                zoom={zoom}
                enableTorch={torchEnabled}
                autofocus="off"
                ratio="16:9"
                onCameraReady={() => {
                  setPreviewReady(true);
                  setCameraDebug('Camera preview is ready');
                }}
                onMountError={(event) => {
                  setCameraEnabled(false);
                  setPreviewReady(false);
                  setCameraDebug(event.message || 'CameraView mount error');
                  setCameraError(event.message || 'The camera failed to start here.');
                }}
                onBarcodeScanned={cameraEnabled ? handleBarcodeScanned : undefined}
                barcodeScannerSettings={{ barcodeTypes }}
              />
              {previewReady ? (
                <Pressable
                  className="absolute inset-0 items-center justify-center"
                  onPress={() => setCameraDebug('Tap-to-focus is not exposed by this Expo camera runtime; use zoom and hold steady instead.')}
                >
                  <View className="h-[150px] w-[78%] rounded-[24px] border-2 border-parchment/90 bg-transparent" />
                  <Text className="mt-4 rounded-full bg-black/40 px-4 py-2 text-xs text-parchment">
                    Tap for focus help • center the barcode inside the frame
                  </Text>
                </Pressable>
              ) : null}
              {!previewReady ? (
                <View className="absolute inset-0 items-center justify-center px-6">
                  <Text className="text-center text-sm leading-6 text-parchment">
                    Waiting for camera preview to appear… if this never changes, Safari is being weird and we will bully it next.
                  </Text>
                </View>
              ) : null}
            </View>
            <View className="gap-3 rounded-[24px] border border-line bg-parchment p-4">
              <Text className="text-xs uppercase tracking-[2px] text-mist">Scan quality</Text>
              <View className="flex-row flex-wrap gap-2">
                {zoomPresets.map((preset) => (
                  <Button
                    key={preset.label}
                    label={preset.label}
                    variant={zoom === preset.value ? 'primary' : 'secondary'}
                    onPress={() => setZoom(preset.value)}
                  />
                ))}
                <Button
                  label={torchEnabled ? 'Torch on' : 'Torch off'}
                  variant={torchEnabled ? 'primary' : 'secondary'}
                  onPress={() => setTorchEnabled((current) => !current)}
                />
              </View>
              <Text className="text-sm leading-6 text-mist">
                Tap the preview for guidance, not true tap-to-focus. Expo camera in this runtime does not expose focus-point control, because apparently that would be too convenient.
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-3">
              <Button label="Pause scanner" variant="secondary" onPress={() => setCameraEnabled(false)} />
              <Button label="Lookup current ISBN" variant="secondary" onPress={() => void hydrateFromIsbn()} disabled={lookupPending} />
            </View>
          </View>
        ) : null}

        {!cameraEnabled && permissionState === 'granted' && (cameraAvailable !== false || canAttemptCameraOnThisPlatform) ? (
          <View className="flex-row flex-wrap gap-3">
            <Button label={lastScannedIsbn ? 'Scan another book' : 'Open scanner'} variant="secondary" onPress={() => void enableCamera()} />
          </View>
        ) : null}

        <View className="rounded-[20px] border border-line bg-[#F8F3EA] p-4">
          <Text className="text-xs uppercase tracking-[2px] text-mist">Debug</Text>
          <Text className="mt-2 text-sm leading-6 text-ink">platform: {Platform.OS}</Text>
          <Text className="text-sm leading-6 text-ink">permission: {permissionState}</Text>
          <Text className="text-sm leading-6 text-ink">cameraEnabled: {formatDebugValue(cameraEnabled)}</Text>
          <Text className="text-sm leading-6 text-ink">cameraAvailable: {formatDebugValue(cameraAvailable)}</Text>
          <Text className="text-sm leading-6 text-ink">lookupPending: {formatDebugValue(lookupPending)}</Text>
          <Text className="text-sm leading-6 text-ink">previewReady: {formatDebugValue(previewReady)}</Text>
          <Text className="text-sm leading-6 text-ink">zoom: {zoom}</Text>
          <Text className="text-sm leading-6 text-ink">torchEnabled: {formatDebugValue(torchEnabled)}</Text>
          <Text className="text-sm leading-6 text-ink">cameraDebug: {cameraDebug}</Text>
        </View>

        {lastScannedIsbn ? <Text className="text-sm text-mist">Last scanned ISBN: {lastScannedIsbn}</Text> : null}
        {cameraError ? <Text className="text-sm text-red-700">{cameraError}</Text> : null}
        {lookupMessage ? <Text className="text-sm text-accent">{lookupMessage}</Text> : null}
        {lookupError ? <Text className="text-sm text-red-700">{lookupError}</Text> : null}
      </View>

      <View className="gap-4 rounded-[28px] border border-line bg-paper p-6">
        <BookFormFields control={control} errors={errors} />
        <View className="flex-row flex-wrap gap-3">
          <Button label={lookupPending ? 'Looking up...' : 'Lookup ISBN'} variant="secondary" onPress={() => void hydrateFromIsbn()} disabled={lookupPending} />
          <Button label={createBook.isPending ? 'Saving...' : 'Save scanned book'} onPress={handleSubmit(onSubmit)} disabled={createBook.isPending} />
        </View>
      </View>
    </ScrollView>
  );
}

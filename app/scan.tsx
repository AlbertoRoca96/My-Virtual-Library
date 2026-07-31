import { zodResolver } from '@hookform/resolvers/zod';
import { CameraView, BarcodeScanningResult, BarcodeType, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import { ErrorBoundaryProps, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, Linking, Platform, ScrollView, Text, View } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AndroidWebLiveIsbnScanner } from '@/components/book/android-web-live-isbn-scanner';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/features/auth/auth-card';
import { BookFormFields } from '@/features/books/book-form-fields';
import { BookFormValues, bookFormSchema, parseGenreString } from '@/features/books/book-form-schema';
import { sanitizeIsbn, isValidIsbnLength } from '@/features/books/isbn';
import { MetadataRescueCard } from '@/features/books/metadata-rescue-card';
import { ScanFormActionBar } from '@/features/books/scan-form-action-bar';
import { ScanPageHeader } from '@/features/books/scan-page-header';
import { ScannerDebugCard } from '@/features/books/scanner-debug-card';
import { fetchBookDraftByClues, fetchBookDraftByIsbn } from '@/features/books/open-library';
import { useCreateBook } from '@/features/books/use-books';
import { useAuth } from '@/lib/auth';

const defaultValues: BookFormValues = { title: '', author: '', publisher: '', isbn: '', description: '', readingStatus: 'owned', genres: '' };

const barcodeTypes: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'];
const canAttemptCameraOnThisPlatform = Platform.OS === 'web';
const shouldProbeCameraAvailability = Platform.OS === 'web';
const prefersNativeScanner = Platform.OS !== 'web' && CameraView.isModernBarcodeScannerAvailable;
const isAndroidWeb = Platform.OS === 'web' && typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
const zoomPresets = [{ label: '1x', value: 0 }, { label: '1.5x', value: 0.15 }, { label: '2x', value: 0.3 }] as const;

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
  return <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 24, gap: 24 }}><View className="gap-4 rounded-[28px] border border-red-300 bg-red-50 p-6"><Text className="text-3xl text-red-900" style={{ fontFamily: 'Georgia' }}>Scan page crashed</Text><Text className="text-base leading-7 text-red-900">Instead of a majestic blank white void, here is the actual error. Tiny progress. You can still use manual ISBN lookup after we fix this.</Text><Text className="rounded-[20px] bg-white px-4 py-3 font-mono text-sm text-red-900">{error.message}</Text><View className="gap-3 md:flex-row"><Button label="Try again" onPress={retry} /></View></View></ScrollView>;
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
  const [nativeScannerActive, setNativeScannerActive] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');
  const [permissionDebug, setPermissionDebug] = useState('permission hook not resolved yet');
  const [lookupError, setLookupError] = useState('');
  const [lookupPending, setLookupPending] = useState(false);
  const [metadataRescueVisible, setMetadataRescueVisible] = useState(false);
  const [metadataRescuePending, setMetadataRescuePending] = useState(false);
  const [lastScannedIsbn, setLastScannedIsbn] = useState('');
  const [saveDebug, setSaveDebug] = useState('save idle');
  const [saveErrorDebug, setSaveErrorDebug] = useState('none');
  const [titleDebug, setTitleDebug] = useState('no lookup result yet');
  const [zoom, setZoom] = useState(isAndroidWeb ? 0 : 0.15);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const scanInFlightRef = useRef(false);
  const { control, handleSubmit, formState: { errors }, getValues, reset } = useForm<BookFormValues>({ resolver: zodResolver(bookFormSchema), defaultValues });

  useEffect(() => {
    if (!prefersNativeScanner) {
      return;
    }

    const subscription = CameraView.onModernBarcodeScanned((result) => {
      const isbn = sanitizeIsbn(result.data);
      setNativeScannerActive(false);
      if (!isValidIsbnLength(isbn)) {
        setLookupMessage('');
        setLookupError('Scanned code was not a usable ISBN. Try again, or type it manually.');
        return;
      }

      setLastScannedIsbn(isbn);
      setLookupError('');
      setLookupMessage(`Scanned ${isbn}. Looking up book data...`);
      void hydrateFromIsbn(isbn);
    });

    return () => {
      subscription.remove();
      void CameraView.dismissScanner().catch(() => undefined);
    };
  }, [prefersNativeScanner]);

  useEffect(() => {
    let active = true;

    async function detectCameraAvailability() {
      if (!shouldProbeCameraAvailability) {
        if (active) {
          setCameraAvailable(null);
          setCameraDebug('Skipping CameraView.isAvailableAsync probe on native app runtime; allowing permission + mount flow');
        }
        return;
      }

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
          setCameraAvailable(null);
          setCameraDebug(error instanceof Error ? error.message : 'Unknown camera availability error');
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
    if (permission.canAskAgain) return 'blocked-awaiting-grant';
    return 'denied';
  }, [permission]);

  useEffect(() => {
    if (!permission) {
      setPermissionDebug('permission hook not resolved yet');
      return;
    }

    setPermissionDebug(`status=${permission.status}, granted=${permission.granted ? 'true' : 'false'}, canAskAgain=${permission.canAskAgain ? 'true' : 'false'}, expires=${permission.expires}`);
  }, [permission]);

  function clearBookForm() {
    reset(defaultValues);
    setLastScannedIsbn('');
    setLookupMessage('');
    setLookupError('');
    setMetadataRescueVisible(false);
    setMetadataRescuePending(false);
    setSaveDebug('form cleared');
    setSaveErrorDebug('none');
    setTitleDebug('form cleared; no lookup result yet');
  }

  async function openNativeScanner() {
    setLookupError('');
    setLookupMessage('Opening device scanner...');
    setNativeScannerActive(true);
    setCameraDebug('Launching native barcode scanner');

    try {
      await CameraView.launchScanner({ barcodeTypes });
      setCameraDebug('Native barcode scanner launched');
    } catch (error) {
      setNativeScannerActive(false);
      setLookupMessage('');
      setCameraError(error instanceof Error ? error.message : 'Could not open the device barcode scanner.');
    }
  }

  async function openAppSettings() {
    try {
      await Linking.openSettings();
      setCameraDebug('Opened app settings for manual camera permission changes');
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : 'Could not open app settings.');
    }
  }

  async function enableCamera() {
    setCameraError('');
    setLookupError('');
    setLookupMessage('');
    setMetadataRescueVisible(false);
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
        setCameraError(
          result.canAskAgain
            ? 'Camera permission was not granted yet. Try again, or use manual ISBN lookup below.'
            : 'Camera permission is denied at the OS level for this app. Open app settings, allow Camera, then come back and retry.'
        );
        return;
      }

      if (prefersNativeScanner) {
        await openNativeScanner();
        return;
      }

      setCameraEnabled(true);
      setCameraDebug('Permission granted; attempting to mount scanner');
    } catch (error) {
      setCameraEnabled(false);
      setCameraError(error instanceof Error ? error.message : 'Could not request camera permission.');
    }
  }

  async function scanBarcodePhotoFromDevice() {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      setLookupError('Camera photo fallback is only available in the mobile browser flow.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setLookupError('');
      setLookupMessage('Scanning barcode from captured photo...');
      setCameraDebug('Scanning still image fallback');

      try {
        const results = await scanFromURLAsync(objectUrl, barcodeTypes);
        const firstMatch = results.find((result) => isValidIsbnLength(sanitizeIsbn(result.data)));

        if (!firstMatch) {
          setLookupMessage('No usable ISBN found in that photo. Try again with the barcode filling more of the frame and better light.');
          return;
        }

        const isbn = sanitizeIsbn(firstMatch.data);
        setLastScannedIsbn(isbn);
        setLookupMessage(`Found ISBN ${isbn} in the photo. Looking up book data...`);
        await hydrateFromIsbn(isbn);
      } catch (error) {
        setLookupMessage('');
        setLookupError(error instanceof Error ? error.message : 'Could not scan the captured barcode photo.');
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    input.click();
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
    setMetadataRescueVisible(false);
    setLookupMessage('Looking up book data...');

    try {
      const draft = await fetchBookDraftByIsbn(isbn);
      if (!draft) {
        setTitleDebug(`ISBN lookup returned null for ${isbn}`);
        setLookupMessage('Nothing came back from Open Library. Use the form below with clues from the front/back cover and try the metadata rescue search.');
        setMetadataRescueVisible(true);
        reset({ ...getValues(), isbn });
        return;
      }

      setMetadataRescueVisible(false);
      setTitleDebug(`ISBN lookup title resolved to: ${draft.title || '[empty]'}`);
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

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
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
  }, [lookupPending]);

  async function rescueMetadataFromCoverClues() {
    if (metadataRescuePending) {
      return;
    }

    const values = getValues();
    const hasClues = [values.title, values.author, values.publisher, values.isbn].some((value) => (value ?? '').trim().length > 0);
    if (!hasClues) {
      setLookupError('Add at least a title, author, publisher, or ISBN clue before trying metadata rescue.');
      return;
    }

    setMetadataRescuePending(true);
    setLookupError('');
    setLookupMessage('Searching broader metadata using your cover clues...');

    try {
      const draft = await fetchBookDraftByClues(values);
      if (!draft) {
        setTitleDebug('Metadata rescue returned null');
        setLookupMessage('Still nothing solid came back. At least now the form is right there for manual cleanup instead of a dead end.');
        return;
      }

      setTitleDebug(`Metadata rescue title resolved to: ${draft.title || '[empty]'}`);
      reset({ ...values, ...draft, isbn: sanitizeIsbn(values.isbn ?? draft.isbn ?? '') });
      setMetadataRescueVisible(false);
      setLookupMessage('Metadata rescue found a likely match. Tidy anything weird, then save.');
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Metadata rescue failed.');
      setLookupMessage('');
    } finally {
      setMetadataRescuePending(false);
    }
  }

  const onSubmit = (values: BookFormValues) => {
    const payload = {
      ...values,
      isbn: sanitizeIsbn(values.isbn),
      genres: parseGenreString(values.genres),
    };

    setSaveDebug(`saving isbn=${payload.isbn || '[empty]'} title=${payload.title || '[empty]'} genres=${payload.genres.join('|') || '[none]'} status=${payload.readingStatus}`);
    setSaveErrorDebug('none');

    createBook.mutate(payload, {
      onSuccess: () => {
        setSaveDebug('save succeeded');
        Alert.alert('Book saved', 'Scanned book added to your virtual bookshelf.');
        router.push('/bookshelf');
      },
      onError: (error: Error & { code?: string; details?: string; hint?: string }) => {
        setSaveErrorDebug(`name=${error.name || 'Error'} code=${error.code || 'n/a'} message=${error.message || 'n/a'} details=${error.details || 'n/a'} hint=${error.hint || 'n/a'}`);
        Alert.alert('Save failed', error.message);
      },
    });
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
      <ScanPageHeader />

      <View className="gap-4 rounded-[28px] border border-line bg-paper p-5">
        {isAndroidWeb ? (
          <View className="gap-4 rounded-[24px] border border-dashed border-accent bg-[#EADFCF] p-5">
            {!cameraEnabled ? (
              <>
                <Text className="text-lg text-ink" style={{ fontFamily: 'Georgia' }}>
                  Live Android scan
                </Text>
                <Text className="text-base leading-7 text-mist">
                  On Pixel/Android web we now try a direct live camera stream first. As soon as the first valid ISBN is recognized, we autofill the form and keep you here to edit before saving. If the browser still behaves like a melted spoon, the photo fallback is below.
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  <Button label="Start live scanner" onPress={() => void enableCamera()} />
                  <Button label="Use photo fallback" variant="secondary" onPress={() => void scanBarcodePhotoFromDevice()} />
                </View>
              </>
            ) : (
              <AndroidWebLiveIsbnScanner
                active={cameraEnabled}
                onDebug={setCameraDebug}
                onDetected={(rawValue) =>
                  handleBarcodeScanned({
                    type: 'ean13',
                    data: rawValue,
                    cornerPoints: [],
                    bounds: { origin: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
                  })
                }
              />
            )}
          </View>
        ) : !cameraEnabled && !nativeScannerActive ? (
          <View className="gap-3 rounded-[24px] border border-dashed border-accent bg-[#EADFCF] p-5">
            <Text className="text-lg text-ink" style={{ fontFamily: 'Georgia' }}>
              Camera access needed
            </Text>
            <Text className="text-base leading-7 text-mist">
              {prefersNativeScanner
                ? 'On this device we can use the native barcode scanner instead of the embedded camera box, which should behave a lot less like a drunk potato.'
                : 'Allow camera access to scan on Android or web. If that does not work on this device, manual ISBN lookup below will still do the job.'}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <Button label={prefersNativeScanner ? 'Open device scanner' : 'Allow camera'} onPress={() => void enableCamera()} />
              {permission && !permission.granted ? (
                <Button label="Open app settings" variant="secondary" onPress={() => void openAppSettings()} />
              ) : null}
            </View>
          </View>
        ) : null}

        {nativeScannerActive ? <View className="gap-3 rounded-[24px] border border-line bg-parchment p-5"><Text className="text-lg text-ink" style={{ fontFamily: 'Georgia' }}>Native scanner open</Text><Text className="text-base leading-7 text-mist">Use the device barcode scanner UI to scan the ISBN. If it closes without a result, tap the button below to reopen it or type the ISBN manually.</Text><View className="flex-row flex-wrap gap-3"><Button label="Reopen scanner" variant="secondary" onPress={() => void openNativeScanner()} /></View></View> : null}

        {cameraEnabled && !isAndroidWeb && !prefersNativeScanner && permissionState === 'granted' && (cameraAvailable !== false || canAttemptCameraOnThisPlatform) ? (
          <View className="gap-4">
            <Text className="text-sm leading-6 text-mist">
              Point the camera at the barcode on the back of the book and keep the lines inside the guide frame. On Android web, start at 1x first. If the live preview stays blurry, use the photo fallback below so the phone can autofocus a still image properly.
            </Text>
            <View className="h-[360px] overflow-hidden rounded-[28px] border border-line bg-night">
              <CameraView
                style={{ flex: 1, width: '100%' }}
                facing="back"
                zoom={zoom}
                enableTorch={torchEnabled}
                autofocus={isAndroidWeb ? undefined : 'off'}
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
                <View className="absolute inset-0 items-center justify-center pointer-events-none">
                  <View className="h-[150px] w-[78%] rounded-[24px] border-2 border-parchment/90 bg-transparent" />
                  <Text className="mt-4 rounded-full bg-black/40 px-4 py-2 text-xs text-parchment">
                    Center the barcode inside the frame
                  </Text>
                </View>
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
                Android web preview focus is still device/browser-dependent. If it stays blurry, use the fallback button below to capture a still photo of the barcode instead.
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-3">
              <Button label="Pause scanner" variant="secondary" onPress={() => setCameraEnabled(false)} />
              <Button label="Lookup current ISBN" variant="secondary" onPress={() => void hydrateFromIsbn()} disabled={lookupPending} />
              {isAndroidWeb ? <Button label="Use camera photo fallback" variant="secondary" onPress={() => void scanBarcodePhotoFromDevice()} /> : null}
            </View>
          </View>
        ) : null}

        {!cameraEnabled && !isAndroidWeb && !prefersNativeScanner && permissionState === 'granted' && (cameraAvailable !== false || canAttemptCameraOnThisPlatform) ? (
          <View className="flex-row flex-wrap gap-3">
            <Button label={lastScannedIsbn ? 'Scan another book' : 'Open scanner'} variant="secondary" onPress={() => void enableCamera()} />
          </View>
        ) : null}

        <ScannerDebugCard
          permissionState={permissionState}
          permissionDebug={permissionDebug}
          cameraEnabled={formatDebugValue(cameraEnabled)}
          cameraAvailable={formatDebugValue(cameraAvailable)}
          lookupPending={formatDebugValue(lookupPending)}
          previewReady={formatDebugValue(previewReady)}
          nativeScannerActive={formatDebugValue(nativeScannerActive)}
          prefersNativeScanner={formatDebugValue(prefersNativeScanner)}
          isAndroidWeb={formatDebugValue(isAndroidWeb)}
          zoom={zoom}
          torchEnabled={formatDebugValue(torchEnabled)}
          cameraDebug={cameraDebug}
          saveDebug={saveDebug}
          saveErrorDebug={saveErrorDebug}
          titleDebug={titleDebug}
          onRetryPermission={() => void enableCamera()}
          onOpenSettings={() => void openAppSettings()}
        />
        <MetadataRescueCard visible={metadataRescueVisible} pending={metadataRescuePending} onSearch={() => void rescueMetadataFromCoverClues()} />
        {isAndroidWeb ? <Text className="text-sm text-mist">Android web scan mode: live detection first, photo fallback second, then autofill + manual review.</Text> : null}
        {lastScannedIsbn ? <Text className="text-sm text-mist">Last scanned ISBN: {lastScannedIsbn}</Text> : null}
        {cameraError ? <Text className="text-sm text-red-700">{cameraError}</Text> : null}
        {lookupMessage ? <Text className="text-sm text-accent">{lookupMessage}</Text> : null}
        {lookupError ? <Text className="text-sm text-red-700">{lookupError}</Text> : null}
      </View>

      <View className="gap-4 rounded-[28px] border border-line bg-paper p-6">
        <BookFormFields control={control} errors={errors} />
        <View className="flex-row flex-wrap gap-3">
          <ScanFormActionBar
            lookupPending={lookupPending}
            metadataRescuePending={metadataRescuePending}
            savePending={createBook.isPending}
            onClear={clearBookForm}
            onLookup={() => void hydrateFromIsbn()}
            onRescue={() => void rescueMetadataFromCoverClues()}
            onSave={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

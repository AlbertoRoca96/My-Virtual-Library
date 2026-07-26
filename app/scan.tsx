import { zodResolver } from '@hookform/resolvers/zod';
import { CameraView, BarcodeScanningResult, BarcodeType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

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

export default function ScanScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const createBook = useCreateBook();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [lookupMessage, setLookupMessage] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupPending, setLookupPending] = useState(false);
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

    CameraView.isAvailableAsync()
      .then((available) => {
        if (active) {
          setCameraAvailable(available);
        }
      })
      .catch(() => {
        if (active) {
          setCameraAvailable(false);
          setCameraError('This device or browser is not exposing a usable camera. Manual ISBN lookup still works below.');
        }
      });

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

    if (cameraAvailable === false) {
      setCameraError('No camera is available here. Use manual ISBN lookup below instead.');
      return;
    }

    try {
      const result = await requestPermission();
      if (!result.granted) {
        setCameraEnabled(false);
        setCameraError('Camera permission was denied. You can still paste an ISBN and lookup the book manually.');
        return;
      }

      setCameraEnabled(true);
    } catch (error) {
      setCameraEnabled(false);
      setCameraError(error instanceof Error ? error.message : 'Could not request camera permission.');
    }
  }

  async function hydrateFromIsbn(rawValue?: string) {
    const isbn = sanitizeIsbn(rawValue ?? getValues('isbn'));
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
    const isbn = sanitizeIsbn(result.data);
    if (!isValidIsbnLength(isbn)) {
      setLookupError('Scanned code was not a usable ISBN. Try again or type it manually.');
      return;
    }

    setCameraEnabled(false);
    void hydrateFromIsbn(isbn);
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

        {cameraEnabled && permissionState === 'granted' && cameraAvailable !== false ? (
          <View className="gap-4">
            <View className="overflow-hidden rounded-[28px] border border-line bg-night">
              <CameraView
                style={{ height: 320 }}
                facing="back"
                onMountError={(event) => {
                  setCameraEnabled(false);
                  setCameraError(event.message || 'The camera failed to start here.');
                }}
                onBarcodeScanned={cameraEnabled ? handleBarcodeScanned : undefined}
                barcodeScannerSettings={{ barcodeTypes }}
              />
            </View>
            <View className="flex-row flex-wrap gap-3">
              <Button label="Pause scanner" variant="secondary" onPress={() => setCameraEnabled(false)} />
              <Button label="Lookup current ISBN" variant="secondary" onPress={() => void hydrateFromIsbn()} disabled={lookupPending} />
            </View>
          </View>
        ) : null}

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

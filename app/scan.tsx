import { zodResolver } from '@hookform/resolvers/zod';
import { CameraView, BarcodeScanningResult, BarcodeType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

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
  const [cameraEnabled, setCameraEnabled] = useState(true);
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

  const permissionState = useMemo(() => {
    if (!permission) return 'unknown';
    if (permission.granted) return 'granted';
    return 'denied';
  }, [permission]);

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
        isbn: sanitizeIsbn(values.isbn ?? ''),
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
          This works on Android and on the web when camera permission is allowed. Scan first, let Open Library prefill what it can, then edit whatever it gets wrong because metadata on the internet is never fully trustworthy.
        </Text>
      </View>

      <View className="gap-4 rounded-[28px] border border-line bg-paper p-5">
        {permissionState !== 'granted' ? (
          <View className="gap-3 rounded-[24px] border border-dashed border-accent bg-[#EADFCF] p-5">
            <Text className="text-lg text-ink" style={{ fontFamily: 'Georgia' }}>
              Camera access needed
            </Text>
            <Text className="text-base leading-7 text-mist">
              Give camera permission to scan on Android or web. If the browser or device refuses, manual ISBN lookup still works right below because we believe in contingency plans.
            </Text>
            <Button label="Allow camera" onPress={() => void requestPermission()} />
          </View>
        ) : (
          <View className="gap-4">
            <View className="overflow-hidden rounded-[28px] border border-line bg-night">
              <CameraView
                style={{ height: 320 }}
                facing="back"
                onBarcodeScanned={cameraEnabled ? handleBarcodeScanned : undefined}
                barcodeScannerSettings={{ barcodeTypes }}
              />
            </View>
            <View className="flex-row flex-wrap gap-3">
              <Button label={cameraEnabled ? 'Pause scanner' : 'Resume scanner'} variant="secondary" onPress={() => setCameraEnabled((value) => !value)} />
              <Button label="Lookup current ISBN" variant="secondary" onPress={() => void hydrateFromIsbn()} disabled={lookupPending} />
            </View>
          </View>
        )}

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

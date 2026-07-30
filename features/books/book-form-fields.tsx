import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { BookFormValues } from '@/features/books/book-form-schema';

type BookFormFieldsProps = {
  control: Control<BookFormValues>;
  errors: FieldErrors<BookFormValues>;
};

const readingStatuses: BookFormValues['readingStatus'][] = ['owned', 'reading', 'wishlist', 'read'];

export function BookFormFields({ control, errors }: BookFormFieldsProps) {
  return (
    <>
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <TextField label="Title" value={field.value} onChangeText={field.onChange} error={errors.title?.message} />
        )}
      />
      <Controller
        control={control}
        name="author"
        render={({ field }) => (
          <TextField label="Author" value={field.value} onChangeText={field.onChange} error={errors.author?.message} />
        )}
      />
      <Controller
        control={control}
        name="publisher"
        render={({ field }) => <TextField label="Publisher" value={field.value ?? ''} onChangeText={field.onChange} />}
      />
      <Controller
        control={control}
        name="isbn"
        render={({ field }) => (
          <TextField
            label="ISBN"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            placeholder=""
            autoCapitalize="none"
            keyboardType="numeric"
          />
        )}
      />
      <Controller
        control={control}
        name="genres"
        render={({ field }) => (
          <TextField
            label="Genres"
            value={field.value}
            onChangeText={field.onChange}
            placeholder=""
            error={errors.genres?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="readingStatus"
        render={({ field }) => (
          <View className="gap-2">
            <Text className="text-sm font-semibold uppercase tracking-[1.5px] text-mist">Reading status</Text>
            <View className="flex-row flex-wrap gap-2">
              {readingStatuses.map((status) => (
                <Button
                  key={status}
                  label={status}
                  variant={field.value === status ? 'primary' : 'secondary'}
                  onPress={() => field.onChange(status)}
                />
              ))}
            </View>
          </View>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField
            label="Notes"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            placeholder=""
            multiline
          />
        )}
      />
    </>
  );
}

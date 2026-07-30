import { Button } from '@/components/ui/button';

type ScanFormActionBarProps = {
  lookupPending: boolean;
  metadataRescuePending: boolean;
  savePending: boolean;
  onClear: () => void;
  onLookup: () => void;
  onRescue: () => void;
  onSave: () => void;
};

export function ScanFormActionBar(props: ScanFormActionBarProps) {
  return (
    <>
      <Button label="Clear all fields" variant="secondary" onPress={props.onClear} />
      <Button label={props.lookupPending ? 'Looking up...' : 'Lookup ISBN'} variant="secondary" onPress={props.onLookup} disabled={props.lookupPending} />
      <Button label={props.metadataRescuePending ? 'Searching clues...' : 'Rescue with cover clues'} variant="secondary" onPress={props.onRescue} disabled={props.metadataRescuePending} />
      <Button label={props.savePending ? 'Saving...' : 'Save scanned book'} onPress={props.onSave} disabled={props.savePending} />
    </>
  );
}

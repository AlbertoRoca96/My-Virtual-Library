import { Platform, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

type ScannerDebugCardProps = {
  permissionState: string;
  permissionDebug: string;
  cameraEnabled: string;
  cameraAvailable: string;
  lookupPending: string;
  previewReady: string;
  nativeScannerActive: string;
  prefersNativeScanner: string;
  isAndroidWeb: string;
  zoom: number;
  torchEnabled: string;
  cameraDebug: string;
  saveDebug: string;
  saveErrorDebug: string;
  titleDebug: string;
  onRetryPermission: () => void;
  onOpenSettings: () => void;
};

export function ScannerDebugCard(props: ScannerDebugCardProps) {
  return (
    <View className="rounded-[20px] border border-line bg-[#F8F3EA] p-4">
      <Text className="text-xs uppercase tracking-[2px] text-mist">Debug</Text>
      <Text className="mt-2 text-sm leading-6 text-ink">platform: {Platform.OS}</Text>
      <Text className="text-sm leading-6 text-ink">permission: {props.permissionState}</Text>
      <Text className="text-sm leading-6 text-ink">permissionDebug: {props.permissionDebug}</Text>
      <Text className="text-sm leading-6 text-ink">cameraEnabled: {props.cameraEnabled}</Text>
      <Text className="text-sm leading-6 text-ink">cameraAvailable: {props.cameraAvailable}</Text>
      <Text className="text-sm leading-6 text-ink">lookupPending: {props.lookupPending}</Text>
      <Text className="text-sm leading-6 text-ink">previewReady: {props.previewReady}</Text>
      <Text className="text-sm leading-6 text-ink">nativeScannerActive: {props.nativeScannerActive}</Text>
      <Text className="text-sm leading-6 text-ink">prefersNativeScanner: {props.prefersNativeScanner}</Text>
      <Text className="text-sm leading-6 text-ink">isAndroidWeb: {props.isAndroidWeb}</Text>
      <Text className="text-sm leading-6 text-ink">zoom: {props.zoom}</Text>
      <Text className="text-sm leading-6 text-ink">torchEnabled: {props.torchEnabled}</Text>
      <Text className="text-sm leading-6 text-ink">cameraDebug: {props.cameraDebug}</Text>
      <Text className="text-sm leading-6 text-ink">titleDebug: {props.titleDebug}</Text>
      <Text className="text-sm leading-6 text-ink">saveDebug: {props.saveDebug}</Text>
      <Text className="text-sm leading-6 text-ink">saveErrorDebug: {props.saveErrorDebug}</Text>
      <View className="mt-3 flex-row flex-wrap gap-3">
        <Button label="Retry permission" variant="secondary" onPress={props.onRetryPermission} />
        <Button label="Open settings" variant="secondary" onPress={props.onOpenSettings} />
      </View>
    </View>
  );
}

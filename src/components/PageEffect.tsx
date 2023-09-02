import { useCloudStorageEffect } from "@/utils/CloudStorage";
import { useNetworkEffect } from "@/utils/useNetworkEffect";
import { useNotificationsEffect } from "@/utils/useNotificationsEffect";
import { usePreventPushingViewOffscreen } from "@/utils/usePreventPushingViewOffscreen";
import { useSearchParamsEffect } from "@/utils/useSearchParamsEffect";
import { useTaskEffect } from "@/utils/useTaskEffect";

export function PageEffect() {
  useSearchParamsEffect();
  useTaskEffect();
  useNetworkEffect();
  useNotificationsEffect();
  useCloudStorageEffect();
  usePreventPushingViewOffscreen();
  return null;
}

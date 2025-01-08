import { Language, useSettingsStore } from "@/stores/settings-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export function LanguageSelect() {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const changeLanguage = useSettingsStore((state) => state.changeLanguage);
  return (
    <div className="space-y-2">
      <Label>{t("Language")}</Label>
      <Select
        value={language}
        onValueChange={(value) => changeLanguage(value as Language)}
      >
        <SelectTrigger aria-label="Select language">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en" aria-label="English">
            {t("English")}
          </SelectItem>
          <SelectItem value="de" aria-label="German">
            {t("German")}
          </SelectItem>
          <SelectItem value="fr" aria-label="French">
            {t("French")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

import { cache } from "react";
import { db } from "./index";
import { appSettings } from "./schema";
import { eq } from "drizzle-orm";

export const getAppSetting = cache(async (key: string): Promise<string | null> => {
  try {
    const result = await db
      .select({ value: appSettings.value })
      .from(appSettings)
      .where(eq(appSettings.key, key))
      .limit(1);

    if (result.length > 0) {
      return result[0].value;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch setting for key "${key}":`, error);
    return null;
  }
});

export const getAppSettingsMap = cache(async (): Promise<Record<string, string>> => {
  try {
    const results = await db.select().from(appSettings);
    const map: Record<string, string> = {};
    for (const row of results) {
      map[row.key] = row.value;
    }
    return map;
  } catch (error) {
    console.error("Failed to fetch app settings map:", error);
    return {};
  }
});

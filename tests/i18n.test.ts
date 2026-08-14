import { describe, expect, it } from "vitest";
import { languageFromBrowser } from "../src/i18n";

describe("browser language selection", () => {
  it.each(["ja", "ja-JP", "JA-jp"])("uses Japanese for %s", (language) => {
    expect(languageFromBrowser(language)).toBe("ja");
  });

  it.each(["en", "en-US", "fr", "zh-CN", undefined])("uses English for %s", (language) => {
    expect(languageFromBrowser(language)).toBe("en");
  });
});

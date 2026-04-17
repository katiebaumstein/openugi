import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { loadMessages } from "./messages";

/**
 * Called by next-intl on every request to determine the active locale + messages.
 * No URL-based i18n routing — locale comes from the cookie set by the language switcher.
 */
export default getRequestConfig(async () => {
  const raw = cookies().get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  return {
    locale,
    messages: loadMessages(locale) as never,
  };
});

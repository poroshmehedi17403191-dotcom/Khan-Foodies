import { db } from '@/lib/db';
import { buildThemeCss, themeFromSiteContent } from '@/lib/theme';

export async function SiteThemeStyles() {
  const content = await db.getSiteContent();
  const theme = themeFromSiteContent(content);
  const css = buildThemeCss(theme);

  return <style id="kf-site-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}

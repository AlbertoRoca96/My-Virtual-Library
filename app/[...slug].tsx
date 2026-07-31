import { Redirect, useLocalSearchParams } from 'expo-router';

type SlugParams = {
  slug?: string | string[];
};

const GITHUB_PAGES_BASE_SEGMENT = 'My-Virtual-Bookshelf';

export default function CatchAllRedirect() {
  const params = useLocalSearchParams<SlugParams>();
  const rawSlug = params.slug;
  const slugParts = Array.isArray(rawSlug) ? rawSlug : rawSlug ? [rawSlug] : [];
  const normalizedParts = slugParts[0] === GITHUB_PAGES_BASE_SEGMENT ? slugParts.slice(1) : slugParts;
  const targetPath = normalizedParts.length > 0 ? `/${normalizedParts.join('/')}` : '/';

  return <Redirect href={targetPath} />;
}

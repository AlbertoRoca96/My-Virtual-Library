import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const GITHUB_PAGES_SEGMENT = 'My-Virtual-Bookshelf';

function getGithubPagesBasePath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  return segments[0] === GITHUB_PAGES_SEGMENT ? `/${GITHUB_PAGES_SEGMENT}/` : '/';
}

export function getAuthRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const basePath = getGithubPagesBasePath(window.location.pathname);
    return `${window.location.origin}${basePath}`;
  }

  return Linking.createURL('/');
}

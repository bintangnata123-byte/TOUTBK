/**
 * Safely resolves an asset URL with Vite's BASE_URL for deployment (e.g. GitHub Pages subpaths).
 * @param {string} path - Relative or absolute asset path (e.g., '/questions/PU_q1.png')
 * @returns {string} - Properly prefixed path
 */
export function getAssetUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}

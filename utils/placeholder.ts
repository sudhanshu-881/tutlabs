/**
 * Placeholder image utilities
 * Provides fallback images for when external placeholders fail
 */

export const generatePlaceholderImage = (text: string, width: number = 300, height: number = 200): string => {
  // Create a data URL for a simple placeholder
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    // Fallback to a simple colored div
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
          ${text}
        </text>
      </svg>
    `)}`;
  }
  
  // Create a gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#e5e7eb');
  gradient.addColorStop(1, '#d1d5db');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add text
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL();
};

export const getPlaceholderAvatar = (name: string, size: number = 150): string => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return generatePlaceholderImage(initials, size, size);
};

export const getPlaceholderImage = (text: string, width: number = 300, height: number = 200): string => {
  // Try external placeholder first, fallback to generated
  try {
    return `https://via.placeholder.com/${width}x${height}.png?text=${encodeURIComponent(text)}`;
  } catch {
    return generatePlaceholderImage(text, width, height);
  }
};
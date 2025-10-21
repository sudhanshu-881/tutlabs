export interface HttpError extends Error {
  status: number;
  statusText: string;
  url: string;
}

export async function getApiJson<T>(path: string, params?: Record<string, string | undefined | null>): Promise<T> {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const url = new URL(path, base);
  
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== '') url.searchParams.set(k, String(v));
    }
  }

  try {
    const res = await fetch(url.toString(), { 
      headers: { 
        Accept: 'application/json',
        'Content-Type': 'application/json',
      } 
    });
    
    if (!res.ok) {
      const error = new Error(`Request failed with status ${res.status}`) as HttpError;
      error.status = res.status;
      error.statusText = res.statusText;
      error.url = url.toString();
      
      try {
        const errorData = await res.json();
        error.message = errorData.message || errorData.error || error.message;
      } catch {
        const text = await res.text().catch(() => '');
        error.message = text || error.message;
      }
      
      throw error;
    }
    
    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error; // Re-throw HttpError as-is
    }
    
    // Network or other errors
    const httpError = new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`) as HttpError;
    httpError.status = 0;
    httpError.statusText = 'Network Error';
    httpError.url = url.toString();
    throw httpError;
  }
}

import { useState } from 'react';

type GeolocationState = {
  isLoading: boolean;
  coords: GeolocationCoordinates | null;
  error: Error | null;
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    isLoading: false,
    coords: null,
    error: null,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: new Error("Geolocation is not supported by your browser.") }));
      return;
    }

    setState(s => ({ ...s, isLoading: true, error: null, coords: null }));

    navigator.permissions?.query?.({ name: 'geolocation' as PermissionName }).then((status) => {
      // Some browsers auto-deny without prompt if previously denied; allow reattempt via settings note
    }).catch(() => { /* ignore unsupported Permissions API */ });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({ isLoading: false, coords: position.coords, error: null });
      },
      (error) => {
        let errorMessage = "An unknown error occurred.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permission denied. Please allow location access in your browser settings and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get user location timed out.";
            break;
        }
        setState({ isLoading: false, coords: null, error: new Error(errorMessage) });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

  return { ...state, requestLocation };
};

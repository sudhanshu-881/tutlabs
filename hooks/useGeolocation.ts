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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({ isLoading: false, coords: position.coords, error: null });
      },
      (error) => {
        let errorMessage = "An unknown error occurred.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "You denied the request for Geolocation. Please enable it in your browser settings to use this feature.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get user location timed out.";
            break;
        }
        setState({ isLoading: false, coords: null, error: new Error(errorMessage) });
      }
    );
  };

  return { ...state, requestLocation };
};

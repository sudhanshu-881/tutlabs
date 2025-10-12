type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  state: string;
  country: string;
};

type NominatimResponse = {
  address: NominatimAddress;
  error?: string;
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch location data. Status: ${response.status}`);
    }

    const data: NominatimResponse = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }
    
    const { address } = data;
    const city = address.city || address.town || address.village;
    
    if (city && address.state) {
      return `${city}, ${address.state}`;
    }
    
    if (city) {
      return city;
    }

    return address.state || address.country || "Unknown Location";

  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    throw new Error("Could not determine your location's name.");
  }
};

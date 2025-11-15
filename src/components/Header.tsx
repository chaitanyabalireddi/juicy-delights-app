import { useEffect, useState } from 'react';
import { ChevronDown, ShoppingCart, LogIn, User, MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const Header = () => {
  const { state } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const persistLocation = (city: string, label?: string) => {
    setCurrentCity(city);
    if (label) {
      setLocationLabel(label);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCity', city);
      if (label) {
        localStorage.setItem('selectedAddressLabel', label);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const savedCity = localStorage.getItem('selectedCity');
    const savedLabel = localStorage.getItem('selectedAddressLabel');

    if (savedCity) {
      setCurrentCity(savedCity);
    } else if (user?.address?.length) {
      persistLocation(user.address[0].city, `${user.address[0].street}, ${user.address[0].city}`);
    }

    if (savedLabel) {
      setLocationLabel(savedLabel);
    }
  }, [user]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!isAuthenticated || !locationDialogOpen) return;
      setAddressesLoading(true);
      try {
        const response = await api.get<{ success: boolean; data: { user: { address: Address[] } } }>(
          '/auth/profile',
          true
        );
        if (response.success) {
          setAddresses(response.data.user.address || []);
        }
      } catch (error) {
        console.error('Failed to load addresses', error);
      } finally {
        setAddressesLoading(false);
      }
    };
    fetchAddresses();
  }, [isAuthenticated, locationDialogOpen]);

  const handleAddressSelect = (address: Address) => {
    const label = `${address.street}, ${address.city}`;
    persistLocation(address.city, label);
    toast({
      title: 'Location updated',
      description: `Delivering to ${label}`,
    });
    setLocationDialogOpen(false);
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    const response = await fetch(
      `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();
    return (
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.state ||
      'your city'
    );
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location not supported',
        description: 'Enable location services or add an address manually.',
        variant: 'destructive',
      });
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const detectedCity = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          persistLocation(detectedCity, `Current location • ${detectedCity}`);
          toast({
            title: 'Location detected',
            description: `We’ll show results for ${detectedCity}`,
          });
        } catch (error) {
          console.error('Reverse geocode failed', error);
          toast({
            title: 'Failed to detect city',
            description: 'Please pick a saved address instead.',
            variant: 'destructive',
          });
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error', error);
        toast({
          title: 'Permission denied',
          description: 'Allow location access or choose a saved address.',
          variant: 'destructive',
        });
        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  };

  const greeting = isAuthenticated
    ? `Welcome, ${user?.name?.split(' ')[0] || 'there'}`
    : 'Welcome, Guest';

  const displayCity =
    currentCity ||
    user?.address?.[0]?.city ||
    (isAuthenticated ? 'Set your city' : 'Hyderabad');

  return (
    <>
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{greeting}</p>
            <button
              type="button"
              onClick={() => setLocationDialogOpen(true)}
              className="flex items-center text-left"
            >
              <span className="text-lg font-semibold text-gray-900">
                {displayCity}
              </span>
              <ChevronDown size={20} className="ml-1 text-gray-600" />
            </button>
            {locationLabel && (
              <p className="text-xs text-gray-500 mt-0.5">{locationLabel}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/profile')}
                className="p-2"
              >
                <User size={24} className="text-gray-700" />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="p-2"
              >
                <LogIn size={24} className="text-gray-700" />
              </button>
            )}
            <button 
              onClick={() => navigate('/cart')}
              className="relative p-2"
            >
              <ShoppingCart size={24} className="text-gray-700" />
              {totalItems > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {totalItems}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select your location</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="w-full flex items-center justify-center space-x-2"
            >
              {detectingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-4 h-4" />
                  <span>Use current location</span>
                </>
              )}
            </Button>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Saved addresses</p>
              {isAuthenticated ? (
                addressesLoading ? (
                  <div className="flex items-center justify-center py-6 text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading addresses...
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {addresses.map((address, index) => (
                      <button
                        key={`${address.street}-${index}`}
                        onClick={() => handleAddressSelect(address)}
                        className="w-full border border-gray-200 rounded-lg p-3 text-left hover:border-orange-400 transition-colors"
                      >
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-orange-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{address.street}</p>
                            <p className="text-xs text-gray-600">
                              {address.city}, {address.state} {address.pincode}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4">
                    You have no saved addresses yet. Add one from your profile or the checkout flow.
                  </div>
                )
              ) : (
                <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4">
                  Please log in to save and reuse your addresses.
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setLocationDialogOpen(false);
                navigate('/profile');
              }}
            >
              Manage addresses
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
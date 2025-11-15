import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface AddressManagementProps {
  onAddressSelect?: (address: Address, index: number) => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
};

const AddressManagement = ({ onAddressSelect }: AddressManagementProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Address>({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    coordinates: undefined
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { user: { address: Address[] } } }>('/auth/profile', true);
      if (response.success) {
        setAddresses(response.data.user.address || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
          toast({
            title: 'Success',
            description: 'Location captured successfully',
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Error',
            description: 'Failed to get your location. Please enter manually.',
            variant: 'destructive'
          });
        }
      );
    } else {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive'
      });
    }
  };

  const handleAddAddress = async () => {
    try {
      if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      await api.post('/auth/address', formData, true);
      await fetchAddresses();
      setIsAddingAddress(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Address added successfully',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to add address: ' + getErrorMessage(error, 'Unknown error'),
        variant: 'destructive'
      });
    }
  };

  const handleUpdateAddress = async () => {
    if (editingIndex === null) return;

    try {
      if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      await api.put(`/auth/address/${editingIndex}`, formData, true);
      await fetchAddresses();
      setEditingIndex(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Address updated successfully',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to update address: ' + getErrorMessage(error, 'Unknown error'),
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await api.delete(`/auth/address/${index}`, true);
      await fetchAddresses();
      toast({
        title: 'Success',
        description: 'Address deleted successfully',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to delete address: ' + getErrorMessage(error, 'Unknown error'),
        variant: 'destructive'
      });
    }
  };

  const startEdit = (address: Address, index: number) => {
    setFormData({ ...address });
    setEditingIndex(index);
  };

  const resetForm = () => {
    setFormData({
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      coordinates: undefined
    });
  };

  const handleSelectAddress = (address: Address, index: number) => {
    setSelectedIndex(index);
    if (onAddressSelect) {
      onAddressSelect(address, index);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading addresses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Addresses</h3>
        <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
          <Button
            onClick={() => {
              resetForm();
              setIsAddingAddress(true);
            }}
            className="bg-orange-500 hover:bg-orange-600"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Street Address *</Label>
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="House no., Building name, Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pincode *</Label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="Pincode"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="w-full"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use Current Location
              </Button>
              {formData.coordinates && (
                <p className="text-xs text-green-600">
                  Location captured: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                </p>
              )}
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleAddAddress}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingAddress(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {addresses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No addresses added yet</p>
            <p className="text-sm text-gray-500 mt-1">Add your delivery address to continue</p>
          </div>
        ) : (
          addresses.map((address, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg p-4 border-2 transition-all ${
                selectedIndex === index
                  ? 'border-orange-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onAddressSelect && handleSelectAddress(address, index)}
            >
              {editingIndex === index ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Street Address</Label>
                    <Input
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">City</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">State</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Pincode</Label>
                      <Input
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Country</Label>
                      <Input
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    className="w-full"
                  >
                    <MapPin className="w-3 h-3 mr-2" />
                    Update Location
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleUpdateAddress}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingIndex(null);
                        resetForm();
                      }}
                      className="flex-1"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{address.street}</p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.pincode}
                          </p>
                          <p className="text-xs text-gray-500">{address.country}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(address, index);
                        }}
                        className="h-8 px-2"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(index);
                        }}
                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressManagement;


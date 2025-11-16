import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Building2, MapPin, Phone, Loader2, Trash2, Save, Plus } from 'lucide-react';
import api from '@/lib/api';

interface WarehouseForm {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  distance?: string;
  eta?: string;
  lat?: string;
  lng?: string;
}

interface WarehouseResponse {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  distance?: string;
  eta?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

const defaultForm: WarehouseForm = {
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  distance: '',
  eta: '',
  lat: '',
  lng: ''
};

const AdminWarehouses = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<WarehouseForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchWarehouses();
  }, [isAdmin, navigate]);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data?: { warehouses: WarehouseResponse[] } }>(
        '/warehouses'
      );
      setWarehouses(response?.data?.warehouses || []);
    } catch (error) {
      console.error('Failed to load warehouses', error);
      toast({
        title: 'Error',
        description: 'Unable to load warehouses. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        phone: form.phone.trim(),
        distance: form.distance?.trim() || undefined,
        eta: form.eta?.trim() || undefined,
        coordinates:
          form.lat || form.lng
            ? {
                lat: form.lat ? Number(form.lat) : undefined,
                lng: form.lng ? Number(form.lng) : undefined
              }
            : undefined
      };

      if (editingId) {
        await api.put(`/warehouses/${editingId}`, payload, true);
        toast({ title: 'Updated', description: 'Warehouse updated successfully.' });
      } else {
        await api.post('/warehouses', payload, true);
        toast({ title: 'Created', description: 'Warehouse added successfully.' });
      }

      resetForm();
      await fetchWarehouses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save warehouse.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (warehouse: WarehouseResponse) => {
    setEditingId(warehouse._id);
    setForm({
      name: warehouse.name,
      address: warehouse.address,
      city: warehouse.city,
      state: warehouse.state,
      pincode: warehouse.pincode,
      phone: warehouse.phone,
      distance: warehouse.distance || '',
      eta: warehouse.eta || '',
      lat: warehouse.coordinates?.lat?.toString() || '',
      lng: warehouse.coordinates?.lng?.toString() || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this warehouse?')) return;
    try {
      await api.delete(`/warehouses/${id}`, true);
      toast({ title: 'Deleted', description: 'Warehouse removed successfully.' });
      if (editingId === id) {
        resetForm();
      }
      await fetchWarehouses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete warehouse.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pickup Warehouses</h1>
            <p className="text-gray-600">Manage pickup locations visible to customers.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Building2 className="w-5 h-5 text-primary mr-2" />
            {editingId ? 'Edit Warehouse' : 'Add Warehouse'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Warehouse name"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                rows={2}
                placeholder="Street, area, landmark"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Pincode</Label>
                <Input
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Approx. Distance (optional)</Label>
                <Input
                  value={form.distance}
                  onChange={(e) => setForm({ ...form, distance: e.target.value })}
                  placeholder="e.g., 1.2 km"
                />
              </div>
              <div>
                <Label>Pickup ETA (optional)</Label>
                <Input
                  value={form.eta}
                  onChange={(e) => setForm({ ...form, eta: e.target.value })}
                  placeholder="e.g., 5-10 min"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Latitude (optional)</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                />
              </div>
              <div>
                <Label>Longitude (optional)</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button type="submit" disabled={submitting} className="flex items-center space-x-2">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingId ? 'Update Warehouse' : 'Add Warehouse'}</span>
                  </>
                )}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading warehouses...</p>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No warehouses added yet. Use the form above to create one.</p>
            </div>
          ) : (
            warehouses.map((warehouse) => (
              <div
                key={warehouse._id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{warehouse.name}</h3>
                  <p className="text-sm text-gray-600">
                    {warehouse.address}, {warehouse.city}, {warehouse.state} {warehouse.pincode}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{warehouse.phone}</span>
                    </span>
                    {warehouse.distance && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{warehouse.distance}</span>
                      </span>
                    )}
                    {warehouse.eta && <span>ETA: {warehouse.eta}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-3 mt-3 md:mt-0">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(warehouse)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(warehouse._id)}
                    className="flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWarehouses;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Edit2, Save, X } from 'lucide-react';
import api from '@/lib/api';
import Header from '@/components/Header';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: {
    available: number;
    reserved: number;
    minThreshold: number;
  };
  category: string;
}

const AdminStock = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, [isAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { products: Product[] } }>(
        '/products',
        false
      );
      if (response.success) {
        setProducts(response.data.products || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setStockValue(product.stock.available);
  };

  const handleSave = async (productId: string) => {
    try {
      await api.put(
        `/products/${productId}/stock`,
        { stock: stockValue },
        true
      );
      await fetchProducts();
      setEditingId(null);
    } catch (error: any) {
      alert('Failed to update stock: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setStockValue(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Stock Management</h1>
          <p className="text-gray-600">Manage product inventory</p>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Package className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Category: {product.category}</p>
                  <p className="text-sm text-gray-600">Price: ₹{product.price}</p>
                  
                  {editingId === product._id ? (
                    <div className="mt-4 flex items-center space-x-2">
                      <Input
                        type="number"
                        value={stockValue}
                        onChange={(e) => setStockValue(Number(e.target.value))}
                        className="w-24"
                        min="0"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSave(product._id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Available Stock:</span>
                        <span
                          className={`font-semibold ${
                            product.stock.available < product.stock.minThreshold
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {product.stock.available}
                        </span>
                      </div>
                      {product.stock.available < product.stock.minThreshold && (
                        <p className="text-xs text-red-500 mt-1">
                          Below minimum threshold ({product.stock.minThreshold})
                        </p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="mt-2"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Update Stock
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStock;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import Header from '@/components/Header';

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    product: {
      name: string;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAdmin, navigate]);

  const fetchOrders = async () => {
    try {
      // Since we don't have an admin orders endpoint, we'll try to get all orders
      const response = await api.get<{ success: boolean; data: Order[] }>(
        '/orders',
        true
      );
      if (response.success) {
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Mock data for demo
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(
        `/orders/${orderId}/status`,
        { status },
        true
      );
      await fetchOrders();
    } catch (error: any) {
      alert('Failed to update order: ' + (error.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filter.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">View and manage all orders</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Package className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-gray-900">
                      Order #{order.orderNumber || order._id.slice(-6)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.user?.name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500">{order.user?.email}</p>
                  <p className="text-xs text-gray-500">{order.user?.phone}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="space-y-1 mb-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product?.name || 'Product'} × {item.quantity}
                      </span>
                      <span className="text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-900">Total: ₹{order.total}</span>
                  <div className="flex space-x-2">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order._id, 'confirmed')}
                          className="text-xs"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order._id, 'shipped')}
                          className="text-xs"
                        >
                          Ship
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs"
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                        >
                          Deliver
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;


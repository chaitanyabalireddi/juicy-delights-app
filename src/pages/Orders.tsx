import { Clock, MapPin, Package, CheckCircle, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  createdAt: string;
  estimatedDelivery?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { orders: Order[] } }>('/orders', true);
      if (response.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="w-5 h-5 text-orange" />;
      case 'preparing':
      case 'ready':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'out-for-delivery':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'bg-orange/20 text-orange';
      case 'preparing':
      case 'ready':
        return 'bg-blue-500/20 text-blue-700';
      case 'out-for-delivery':
        return 'bg-purple-500/20 text-purple-700';
      case 'delivered':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'out-for-delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return order.status !== 'delivered';
    }
    return order.status === 'delivered';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">Loading orders...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Orders</h1>

        {/* Order Tabs */}
        <div className="bg-muted rounded-xl p-1 mb-6">
          <div className="flex">
            {[
              { key: 'active', label: 'Active Orders' },
              { key: 'history', label: 'Order History' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-background text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-card rounded-xl shadow-card p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-semibold text-foreground">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {order.deliveryAddress && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <p className="text-sm text-muted-foreground">
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </p>
                  </div>
                )}
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        • {item.quantity}x {item.name}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold text-foreground">₹{order.total.toFixed(2)}</p>
                  <p className="text-xs text-green-600 font-medium">Cash on Delivery</p>
                </div>
                <div className="flex space-x-2">
                  {order.status !== 'delivered' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/track/${order._id}`)}
                      className="bg-orange-50 border-orange-500 text-orange-700 hover:bg-orange-100"
                    >
                      <Truck className="w-4 h-4 mr-1" />
                      Track Order
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    Reorder
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-4">
              <Package className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {activeTab === 'active' ? 'No Active Orders' : 'No Order History'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {activeTab === 'active' 
                ? 'You have no active orders at the moment'
                : 'You haven\'t placed any orders yet'
              }
            </p>
            <Button variant="default">
              Start Shopping
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Orders;
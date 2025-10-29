import { Clock, MapPin, Package, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('active');

  const orders = [
    {
      id: 'ORD001',
      status: 'delivered',
      items: ['2x Mangoes', '1x Apple Box', '500g Strawberries'],
      total: 450,
      date: '2024-09-20',
      deliveryTime: '45 mins',
      address: '123 Main Street, City'
    },
    {
      id: 'ORD002',
      status: 'processing',
      items: ['1x Orange Box', '2x Banana Bunch'],
      total: 280,
      date: '2024-09-23',
      deliveryTime: '30 mins',
      address: '456 Oak Avenue, City'
    },
    {
      id: 'ORD003',
      status: 'shipped',
      items: ['3x Mixed Fruit Box'],
      total: 650,
      date: '2024-09-22',
      deliveryTime: '60 mins',
      address: '789 Pine Road, City'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-5 h-5 text-orange" />;
      case 'shipped':
        return <Package className="w-5 h-5 text-primary" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-orange/20 text-orange';
      case 'shipped':
        return 'bg-primary/20 text-primary';
      case 'delivered':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return order.status !== 'delivered';
    }
    return order.status === 'delivered';
  });

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
            <div key={order.id} className="bg-card rounded-xl shadow-card p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-semibold text-foreground">Order #{order.id}</h3>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <p className="text-sm text-muted-foreground">{order.address}</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm text-muted-foreground">• {item}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold text-foreground">₹{order.total}</p>
                </div>
                <div className="flex space-x-2">
                  {order.status !== 'delivered' && (
                    <Button variant="outline" size="sm">
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
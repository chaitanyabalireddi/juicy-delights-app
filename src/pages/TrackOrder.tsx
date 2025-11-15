import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, Clock, CheckCircle, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import io, { Socket } from 'socket.io-client';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  deliveryPerson?: {
    name: string;
    phone: string;
  };
  estimatedDelivery: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

interface LocationUpdate {
  orderId: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
}

interface StatusUpdate {
  orderId: string;
  status: string;
  timestamp: Date;
}

const TrackOrder = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const response = await api.get<{ success: boolean; data: { order: Order } }>(`/orders/${orderId}`, true);
      if (response.success) {
        setOrder(response.data.order);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch order details';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const initializeSocket = useCallback(() => {
    if (!orderId) return;
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://fruitjet.onrender.com';
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join-delivery', orderId);
    });

    socket.on('location-update', (data: LocationUpdate) => {
      console.log('Location update received:', data);
      setDeliveryLocation(data.location);
    });

    socket.on('status-update', (data: StatusUpdate) => {
      console.log('Status update received:', data);
      fetchOrder();
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }, [orderId, fetchOrder]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      initializeSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [orderId, fetchOrder, initializeSocket]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-orange-500" />;
      case 'confirmed':
      case 'preparing':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'ready':
      case 'out-for-delivery':
        return <Truck className="w-6 h-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Received';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Order';
      case 'ready':
        return 'Ready for Pickup';
      case 'out-for-delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending':
        return 20;
      case 'confirmed':
        return 40;
      case 'preparing':
        return 60;
      case 'ready':
        return 70;
      case 'out-for-delivery':
        return 90;
      case 'delivered':
        return 100;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Button onClick={() => navigate('/orders')}>Go to Orders</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center border-b border-gray-200 sticky top-0 z-10">
        <button onClick={() => navigate('/orders')} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={24} className="text-gray-900" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Track Order</h1>
          <p className="text-sm text-gray-600">#{order.orderNumber}</p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-64 bg-gradient-to-br from-orange-100 to-orange-200">
        <div ref={mapRef} className="w-full h-full flex items-center justify-center">
          {deliveryLocation ? (
            <div className="text-center">
              <MapPin className="w-16 h-16 text-orange-500 mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-medium text-gray-900">Delivery Partner Location</p>
              <p className="text-xs text-gray-600 mt-1">
                Lat: {deliveryLocation.lat.toFixed(6)}, Lng: {deliveryLocation.lng.toFixed(6)}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Waiting for delivery partner location...</p>
              <p className="text-xs text-gray-500 mt-1">Live tracking will appear here</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Order Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            {getStatusIcon(order.status)}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{getStatusText(order.status)}</h3>
              <p className="text-sm text-gray-600">
                {order.status === 'delivered' 
                  ? 'Your order has been delivered' 
                  : `Expected delivery: ${new Date(order.estimatedDelivery).toLocaleTimeString()}`}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
              <div
                style={{ width: `${getProgressPercentage(order.status)}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
              ></div>
            </div>
          </div>

          {/* Status Steps */}
          <div className="mt-6 space-y-4">
            {['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'].map((status, index) => {
              const isCompleted = getProgressPercentage(order.status) >= getProgressPercentage(status);
              const isCurrent = order.status === status;
              
              return (
                <div key={status} className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500'
                        : isCurrent
                        ? 'bg-orange-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {getStatusText(status)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Partner Info */}
        {order.deliveryPerson && order.status === 'out-for-delivery' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Partner</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.deliveryPerson.name}</p>
                  <p className="text-sm text-gray-600">{order.deliveryPerson.phone}</p>
                </div>
              </div>
              <Button
                onClick={() => window.location.href = `tel:${order.deliveryPerson?.phone}`}
                className="bg-green-500 hover:bg-green-600"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h3>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-orange-500 mt-1" />
            <div>
              <p className="font-medium text-gray-900">{order.deliveryAddress.street}</p>
              <p className="text-sm text-gray-600">
                {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-gray-900">Total Amount</p>
                <p className="text-lg font-bold text-orange-500">₹{order.total.toFixed(2)}</p>
              </div>
              <p className="text-sm text-gray-600 mt-1">Payment: Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;


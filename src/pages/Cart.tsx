import { ArrowLeft, Minus, Plus, MapPin, Clock, Truck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { useCart } from '@/contexts/CartContext';
import AddressManagement from '@/components/AddressManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface SelectedAddress {
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

const Cart = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const warehouses = [
    { id: '1', name: 'Green Valley Warehouse', address: '123 Main St', distance: '0.8 km', eta: '5-10 min' },
    { id: '2', name: 'Fresh Hub Central', address: '456 Oak Ave', distance: '1.2 km', eta: '8-15 min' },
    { id: '3', name: 'Fruit Express Station', address: '789 Pine Rd', distance: '2.1 km', eta: '12-20 min' },
  ];

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const handleAddressSelect = (address: SelectedAddress) => {
    setSelectedAddress(address);
    setShowAddressDialog(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCity', address.city);
      localStorage.setItem('selectedAddressLabel', `${address.street}, ${address.city}`);
    }
  };

  const handlePlaceOrder = async () => {
    if (deliveryType === 'delivery' && !selectedAddress) {
      toast({
        title: 'Address Required',
        description: 'Please select a delivery address',
        variant: 'destructive'
      });
      setShowAddressDialog(true);
      return;
    }

    if (deliveryType === 'pickup' && !selectedWarehouse) {
      toast({
        title: 'Pickup Location Required',
        description: 'Please select a pickup location',
        variant: 'destructive'
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        items: state.items.map(item => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: 'kg',
          image: item.image
        })),
        subtotal: state.total,
        deliveryFee: deliveryType === 'pickup' ? 10 : state.deliveryFee,
        serviceFee: 0,
        discount: 0,
        total: state.total + (deliveryType === 'pickup' ? 10 : state.deliveryFee),
        paymentMethod: 'cod',
        deliveryType,
        ...(deliveryType === 'delivery' && selectedAddress ? {
          deliveryAddress: selectedAddress
        } : {}),
        ...(deliveryType === 'pickup' && selectedWarehouse ? {
          pickupLocation: warehouses.find(w => w.id === selectedWarehouse)
        } : {})
      };

      const response = await api.post('/orders', orderData, true);
      
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
        toast({
          title: 'Order Placed Successfully!',
          description: 'Your order has been placed. You will pay cash on delivery.',
        });
        navigate('/orders');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      toast({
        title: 'Order Failed',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const totalAmount = state.total + state.deliveryFee;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-orange/5 pb-20">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-4 flex items-center border-b border-border/50">
          <button onClick={() => navigate('/')} className="mr-4 p-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">YOUR CART (0 ITEMS)</h1>
        </div>
        
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="text-center animate-slide-up">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center text-4xl animate-bounce-in">
              🛒
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 text-lg">Add some delicious fruits to get started!</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg shadow-hover hover:shadow-glow transition-all duration-300 transform hover:scale-105"
            >
              Start Shopping
            </button>
          </div>
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-orange/5 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm px-4 py-4 flex items-center border-b border-border/50 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="mr-4 p-2 hover:bg-accent rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">
          YOUR CART ({state.items.reduce((sum, item) => sum + item.quantity, 0)} ITEM{state.items.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 'S' : ''})
        </h1>
      </div>

      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold mb-6 text-foreground">YOUR CART</h2>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {state.items.map((item, index) => (
            <div key={item.id} className="bg-gradient-card rounded-xl p-4 shadow-card hover:shadow-hover transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-primary rounded-xl flex items-center justify-center relative overflow-hidden shadow-soft">
                  {item.badge && (
                    <div className="absolute top-1 left-1 bg-orange px-2 py-1 rounded-md text-xs font-semibold text-orange-foreground">
                      {item.badge}
                    </div>
                  )}
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{item.badge} {item.name}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                      <p className="font-bold text-primary text-lg mt-1">₹{item.price}/kg</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive/80 transition-colors p-1"
                    >
                      <ArrowLeft size={16} className="rotate-45" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 border-2 border-primary/20 rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors"
                      >
                        <Minus size={18} className="text-primary" />
                      </button>
                      
                      <div className="bg-primary/10 px-4 py-2 rounded-xl">
                        <span className="font-bold text-primary text-lg">{item.quantity}</span>
                      </div>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft hover:shadow-hover transition-all duration-300 transform hover:scale-105"
                      >
                        <Plus size={18} className="text-primary-foreground" />
                      </button>
                      
                      <span className="text-muted-foreground font-medium">Kg</span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-bold text-foreground text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Address Selection */}
        {deliveryType === 'delivery' && (
          <div className="bg-gradient-card rounded-xl p-6 shadow-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Delivery Address</h3>
              <Button
                onClick={() => setShowAddressDialog(true)}
                variant="outline"
                size="sm"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {selectedAddress ? 'Change' : 'Select'} Address
              </Button>
            </div>
            {selectedAddress ? (
              <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">{selectedAddress.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/50 rounded-lg">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No address selected</p>
                <Button
                  onClick={() => setShowAddressDialog(true)}
                  variant="link"
                  size="sm"
                  className="mt-2"
                >
                  Select delivery address
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Delivery/Pickup Selection */}
        <div className="bg-gradient-card rounded-xl p-6 shadow-card mb-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Delivery Options</h3>
          
          <div className="flex space-x-3 mb-6">
            <button
              onClick={() => setDeliveryType('delivery')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                deliveryType === 'delivery' 
                ? 'border-primary bg-primary/10 shadow-glow' 
                : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Truck size={24} className={deliveryType === 'delivery' ? 'text-primary' : 'text-muted-foreground'} />
                <span className={`font-semibold ${deliveryType === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Delivery
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">25-35 min</p>
            </button>
            
            <button
              onClick={() => setDeliveryType('pickup')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                deliveryType === 'pickup' 
                ? 'border-primary bg-primary/10 shadow-glow' 
                : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <MapPin size={24} className={deliveryType === 'pickup' ? 'text-primary' : 'text-muted-foreground'} />
                <span className={`font-semibold ${deliveryType === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`}>
                  Pickup
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">5-15 min</p>
            </button>
          </div>

          {deliveryType === 'pickup' && (
            <div className="space-y-3 animate-slide-up">
              <h4 className="font-semibold text-foreground">Select Pickup Location</h4>
              {warehouses.map((warehouse) => (
                <button
                  key={warehouse.id}
                  onClick={() => setSelectedWarehouse(warehouse.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    selectedWarehouse === warehouse.id
                    ? 'border-success bg-success/10 shadow-glow'
                    : 'border-border bg-background hover:border-success/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-foreground">{warehouse.name}</h5>
                      <p className="text-sm text-muted-foreground">{warehouse.address}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                          {warehouse.distance}
                        </span>
                        <span className="text-xs flex items-center space-x-1 text-muted-foreground">
                          <Clock size={12} />
                          <span>{warehouse.eta}</span>
                        </span>
                      </div>
                    </div>
                    {selectedWarehouse === warehouse.id && (
                      <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center animate-bounce-in">
                        <span className="text-success-foreground text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-gradient-card rounded-xl p-6 shadow-card mb-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Payment Method</h3>
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">Cash on Delivery (COD)</p>
                <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
              </div>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            💡 Currently, we only accept Cash on Delivery
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="bg-gradient-card rounded-xl p-6 shadow-card mb-24">
          <h3 className="text-xl font-bold text-foreground mb-4">Order Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-foreground font-medium">Subtotal</span>
              <span className="font-semibold text-foreground">₹{state.total.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-foreground font-medium">
                {deliveryType === 'delivery' ? 'Delivery Fee' : 'Service Fee'}
              </span>
              <span className="font-semibold text-foreground">
                ₹{deliveryType === 'pickup' ? '10.00' : state.deliveryFee.toFixed(2)}
              </span>
            </div>
            
            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="text-xl font-bold text-foreground">TOTAL AMOUNT</span>
                <span className="text-xl font-bold text-primary">
                  ₹{(state.total + (deliveryType === 'pickup' ? 10 : state.deliveryFee)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proceed to Checkout Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 bg-gradient-to-t from-background via-background to-transparent pt-6">
        <button 
          onClick={handlePlaceOrder}
          className="w-full bg-gradient-success text-success-foreground py-4 rounded-xl font-bold text-lg flex items-center justify-between shadow-hover hover:shadow-glow transition-all duration-300 transform hover:scale-[1.02] animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            isPlacingOrder ||
            (deliveryType === 'pickup' && !selectedWarehouse) ||
            (deliveryType === 'delivery' && !selectedAddress)
          }
        >
          <span>
            {isPlacingOrder ? 'PLACING ORDER...' : 
             deliveryType === 'pickup' && !selectedWarehouse ? 'SELECT PICKUP LOCATION' :
             deliveryType === 'delivery' && !selectedAddress ? 'SELECT DELIVERY ADDRESS' :
             'PLACE ORDER (COD)'}
          </span>
          <span>₹{(state.total + (deliveryType === 'pickup' ? 10 : state.deliveryFee)).toFixed(2)}</span>
        </button>
      </div>

      {/* Address Selection Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Delivery Address</DialogTitle>
          </DialogHeader>
          <AddressManagement onAddressSelect={handleAddressSelect} />
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default Cart;
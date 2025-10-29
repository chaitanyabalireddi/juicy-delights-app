import { Gift, Percent, Clock, Star } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';

const Offers = () => {
  const offers = [
    {
      id: 1,
      title: 'First Order Discount',
      description: 'Get 40% off on your first order above ₹500',
      discount: '40% OFF',
      code: 'FIRST40',
      validUntil: '30 Sep 2024',
      minOrder: 500,
      type: 'discount',
      isNew: true
    },
    {
      id: 2,
      title: 'Weekend Special',
      description: 'Free delivery on all orders during weekends',
      discount: 'FREE DELIVERY',
      code: 'WEEKEND',
      validUntil: '31 Dec 2024',
      minOrder: 0,
      type: 'delivery',
      isNew: false
    },
    {
      id: 3,
      title: 'Bulk Order Bonus',
      description: 'Buy 3kg+ fruits and get 25% extra free',
      discount: '25% EXTRA',
      code: 'BULK25',
      validUntil: '15 Oct 2024',
      minOrder: 1000,
      type: 'bonus',
      isNew: true
    },
    {
      id: 4,
      title: 'Premium Member Deal',
      description: 'Exclusive 30% off for premium members',
      discount: '30% OFF',
      code: 'PREMIUM30',
      validUntil: '31 Oct 2024',
      minOrder: 300,
      type: 'premium',
      isNew: false
    }
  ];

  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <Percent className="w-6 h-6 text-orange" />;
      case 'delivery':
        return <Gift className="w-6 h-6 text-success" />;
      case 'bonus':
        return <Star className="w-6 h-6 text-primary" />;
      case 'premium':
        return <Star className="w-6 h-6 text-destructive" />;
      default:
        return <Percent className="w-6 h-6 text-primary" />;
    }
  };

  const getOfferGradient = (type: string) => {
    switch (type) {
      case 'discount':
        return 'bg-gradient-orange';
      case 'delivery':
        return 'bg-gradient-success';
      case 'bonus':
        return 'bg-gradient-primary';
      case 'premium':
        return 'bg-gradient-card border border-destructive/30';
      default:
        return 'bg-gradient-primary';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Special Offers</h1>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Gift className="w-5 h-5" />
            <span className="text-sm">{offers.length} active offers</span>
          </div>
        </div>

        {/* Featured Offer */}
        <div className="bg-gradient-primary rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-sm font-medium opacity-90">Featured Deal</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Mega Fruit Festival</h2>
            <p className="text-sm opacity-90 mb-4">Get up to 50% off on all fresh fruits this week!</p>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Shop Now
            </Button>
          </div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>

        {/* Offers List */}
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className={`rounded-xl p-6 relative overflow-hidden animate-slide-up ${getOfferGradient(offer.type)}`}>
              {offer.isNew && (
                <div className="absolute top-3 right-3 bg-destructive text-white px-2 py-1 rounded-full text-xs font-semibold">
                  NEW
                </div>
              )}
              
              <div className="flex items-start space-x-4 text-white">
                <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                  {getOfferIcon(offer.type)}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{offer.title}</h3>
                  <p className="text-sm opacity-90 mb-3">{offer.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                          {offer.discount}
                        </span>
                        <span className="text-xs opacity-80">Code: {offer.code}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs opacity-80">
                        <Clock className="w-3 h-3" />
                        <span>Valid until {offer.validUntil}</span>
                      </div>
                      {offer.minOrder > 0 && (
                        <p className="text-xs opacity-80">Min order: ₹{offer.minOrder}</p>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-white text-white hover:bg-white hover:text-primary"
                    >
                      Use Code
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Terms & Conditions */}
        <div className="mt-8 bg-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3">Terms & Conditions</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Offers are valid for limited time only</p>
            <p>• Cannot be combined with other offers</p>
            <p>• Minimum order value conditions apply</p>
            <p>• Free delivery offers exclude remote locations</p>
            <p>• Fruit Festival reserves the right to modify terms</p>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Offers;
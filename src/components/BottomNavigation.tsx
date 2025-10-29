import { Home, Search, ShoppingCart, User, Grid3X3, Heart, Tag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useCart();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: state.items.reduce((sum, item) => sum + item.quantity, 0) },
    { path: '/favorites', icon: Heart, label: 'Favorites' },
    { path: '/offers', icon: Tag, label: 'Offers' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border z-50 animate-slide-up">
      <div className="flex justify-around items-center py-2 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-3 px-4 relative rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-primary bg-primary/10 scale-110' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-bounce-in">
                  {item.badge}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
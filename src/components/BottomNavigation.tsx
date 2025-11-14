import { Home, User, Grid3X3, ShoppingBag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/categories', icon: Grid3X3, label: 'Categories' },
    { path: '/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/profile', icon: User, label: 'Profile' },
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
              className={`flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-primary bg-primary/10 scale-110' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
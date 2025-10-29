import { ChevronDown, ShoppingCart, LogIn, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { state } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {isAuthenticated ? `Welcome, ${user?.name || 'User'}` : 'Welcome, Guest'}
          </p>
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-900">Hyderabad, India</span>
            <ChevronDown size={20} className="ml-1 text-gray-600" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <button 
              onClick={() => navigate('/profile')}
              className="p-2"
            >
              <User size={24} className="text-gray-700" />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="p-2"
            >
              <LogIn size={24} className="text-gray-700" />
            </button>
          )}
          <button 
            onClick={() => navigate('/cart')}
            className="relative p-2"
          >
            <ShoppingCart size={24} className="text-gray-700" />
            {totalItems > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {totalItems}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
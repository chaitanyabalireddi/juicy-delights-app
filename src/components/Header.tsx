import { ChevronDown, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { state } = useCart();
  const navigate = useNavigate();
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Welcome, User</p>
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-900">Hyderabad, India</span>
            <ChevronDown size={20} className="ml-1 text-gray-600" />
          </div>
        </div>
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
  );
};

export default Header;
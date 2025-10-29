import { Search } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import mangoesImg from '@/assets/mangoes.jpg';
import applesImg from '@/assets/apples.jpg';
import strawberriesImg from '@/assets/strawberries.jpg';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState('Delivery');
  const navigate = useNavigate();

  const categories = [
    { name: 'Bulk orders', icon: '📦' },
    { name: 'Exotic fruits', icon: '🥝' },
    { name: 'Gift packs', icon: '🎁' },
    { name: 'Festive Fruits', icon: '🎊' },
  ];

  const seasonalSpecials = [
    {
      id: '1',
      name: 'Mangoes',
      description: 'Fresh Alphonso',
      price: 150,
      originalPrice: 200,
      image: mangoesImg,
      badge: 'Seasonal'
    },
    {
      id: '2', 
      name: 'Apples',
      description: 'Crisp Kashmiri',
      price: 120,
      originalPrice: 160,
      image: applesImg,
      badge: 'Imported'
    },
    {
      id: '3',
      name: 'Strawberries',
      description: 'Sweet & Juicy',
      price: 120,
      originalPrice: 160,
      image: strawberriesImg,
      badge: 'Imported'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <div className="px-4 py-4">
        {/* Delivery/Pickup Toggle */}
        <div className="bg-gray-200 rounded-full p-1 mb-4">
          <div className="flex">
            {['Delivery', 'Pickup'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search 'Apple'"
            className="w-full bg-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Promotional Banner */}
        <div className="bg-gradient-primary rounded-xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Fresh and imported Fruits</h2>
            <h3 className="text-2xl font-bold mb-4">UPTO 40% OFF</h3>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Shop now
            </Button>
          </div>
          <div className="absolute right-4 top-4 bottom-4 w-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Categories</h3>
            <button 
              onClick={() => navigate('/categories')}
              className="text-primary font-medium"
            >
              See all
            </button>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {categories.map((category, index) => (
              <div key={index} className="flex flex-col items-center min-w-[80px]">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
                  {category.icon}
                </div>
                <span className="text-xs text-center text-gray-700 font-medium">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Specials */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Seasonal Specials</h3>
            <button className="text-primary font-medium">See all</button>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {seasonalSpecials.map((item) => (
              <div 
                key={item.id} 
                className="min-w-[160px] bg-white rounded-xl shadow-card overflow-hidden cursor-pointer"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-24 object-cover"
                  />
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    item.badge === 'Seasonal' ? 'bg-orange text-orange-foreground' : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">₹{item.price}</span>
                      <span className="text-xs text-gray-500 line-through ml-1">₹{item.originalPrice}</span>
                    </div>
                    <Button variant="fab" size="xs">
                      <span className="text-sm font-bold">+</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;
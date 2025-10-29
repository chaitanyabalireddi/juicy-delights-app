import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { dispatch } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState('Single piece');

  // Mock product data - in real app, this would come from API
  const product = {
    id: id || '1',
    name: 'Green Grapes',
    description: 'Seedless, Premium Quality',
    price: 80,
    image: '/src/assets/grapes.png',
    badge: 'Organic',
    origin: 'Indian',
    details: [
      'Organic certified',
      'Richly Vitamin C',
      'Source of Antioxidants'
    ],
    quantityOptions: [
      { label: 'Single piece', price: 10, suffix: '₹' },
      { label: 'Half kg', price: 10, suffix: '₹' },
      { label: 'Kg', price: 10, suffix: '₹' }
    ]
  };

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        badge: product.badge
      }
    });

    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center">
        <button onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="px-4">
        {/* Product Image */}
        <div className="bg-gradient-primary rounded-xl mb-6 relative overflow-hidden">
          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full">
            <span className="text-sm font-semibold text-gray-900">{product.badge}</span>
          </div>
          <div className="p-8 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1537640538966-79f369143ef8?w=400&h=300&fit=crop"
              alt={product.name}
              className="w-48 h-32 object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h1>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-2xl font-bold text-gray-900">₹{product.price}<span className="text-base font-normal">/kg</span></p>
            </div>
            <div className="bg-red-500 text-white px-2 py-1 rounded-full flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
              <span className="text-xs font-semibold">{product.origin}</span>
            </div>
          </div>
        </div>

        {/* Quantity Selection */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">SELECT QUANTITY</h3>
          <div className="flex space-x-4">
            {product.quantityOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedQuantity(option.label)}
                className={`flex-1 border-2 rounded-lg p-3 text-center transition-colors ${
                  selectedQuantity === option.label
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300'
                }`}
              >
                <div className="text-sm font-medium mb-1">{option.label}</div>
                <div className="font-bold">{option.suffix}{option.price}</div>
                <Plus className="w-6 h-6 bg-primary text-white rounded-full mx-auto mt-2 p-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl p-4 mb-24">
          <h3 className="text-lg font-semibold mb-4">Product Details</h3>
          <ul className="space-y-2">
            {product.details.map((detail, index) => (
              <li key={index} className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                <span className="text-gray-700">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 bg-white pt-4">
        <button 
          onClick={handleAddToCart}
          className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-between"
        >
          <span>ADD TO CART</span>
          <span>₹{product.price}</span>
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProductDetail;
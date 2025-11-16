import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  badge?: string;
  origin?: string;
  unit?: string;
  category?: string;
  stock?: {
    available: number;
    minThreshold: number;
  };
}

const FALLBACK_IMAGE = '/placeholder.svg';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
};

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { dispatch } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await api.get<{ success: boolean; data?: { product: Product } }>(`/products/${id}`);
        const fetchedProduct = response?.data?.product || (response as any)?.product || null;
        setProduct(fetchedProduct);
        setError(null);
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, 'Unable to load product details.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    for (let count = 0; count < quantity; count += 1) {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || FALLBACK_IMAGE,
          description: product.description,
          badge: product.badge
        }
      });
    }

    toast({
      title: 'Added to cart!',
      description: `${product.name} x${quantity} added to your cart.`,
    });
  };

  const incrementQuantity = () => setQuantity((prev) => Math.min(prev + 1, 10));
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <p className="text-gray-700 mb-4">{error || 'Product not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const productImage = product.images && product.images.length > 0 ? product.images[0] : FALLBACK_IMAGE;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">{product.name}</h1>
      </div>

      <div className="px-4">
        {/* Product Image */}
        <div className="bg-gradient-primary rounded-xl mb-6 relative overflow-hidden">
          {product.badge && (
            <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full">
              <span className="text-sm font-semibold text-gray-900">{product.badge}</span>
            </div>
          )}
          <div className="p-8 flex justify-center">
            <img 
              src={productImage}
              alt={product.name}
              className="w-48 h-32 object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h2>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{product.price}
                <span className="text-base font-normal">{product.unit ? ` / ${product.unit}` : ''}</span>
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-sm text-gray-500 line-through">₹{product.originalPrice}</p>
              )}
            </div>
            {product.origin && (
              <div className="bg-red-500 text-white px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                <span className="text-xs font-semibold">{product.origin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quantity Selection */}
        <div className="bg-white rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Quantity</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={decrementQuantity}
              className="w-12 h-12 border-2 border-primary/20 rounded-full flex items-center justify-center text-primary text-xl"
            >
              <Minus size={18} />
            </button>
            <div className="text-center">
              <p className="text-lg font-bold">{quantity}</p>
              <p className="text-xs text-gray-500">{product.unit || 'unit'}{quantity > 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={incrementQuantity}
              className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl"
            >
              <Plus size={18} />
            </button>
          </div>
          {product.stock && product.stock.available < product.stock.minThreshold && (
            <p className="text-xs text-red-500 mt-3">
              Limited stock available ({product.stock.available} left)
            </p>
          )}
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl p-4 mb-24">
          <h3 className="text-lg font-semibold mb-4">Product Details</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            {product.category && (
              <li className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="font-medium capitalize">{product.category}</span>
              </li>
            )}
            {product.origin && (
              <li className="flex justify-between">
                <span className="text-gray-500">Origin</span>
                <span className="font-medium">{product.origin}</span>
              </li>
            )}
            {product.unit && (
              <li className="flex justify-between">
                <span className="text-gray-500">Unit</span>
                <span className="font-medium uppercase">{product.unit}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 bg-white pt-4">
        <button 
          onClick={handleAddToCart}
          className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-between disabled:opacity-50"
          disabled={!product}
        >
          <span>Add to Cart</span>
          <span>₹{product.price * quantity}</span>
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProductDetail;
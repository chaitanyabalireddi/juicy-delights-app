import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import mangoesImg from '@/assets/mangoes.jpg';
import applesImg from '@/assets/apples.jpg';
import strawberriesImg from '@/assets/strawberries.jpg';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  badge?: string;
  category?: string;
}

interface CategorySummary {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
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

const Index = () => {
  const [activeTab, setActiveTab] = useState('Delivery');
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    setCurrent(carouselApi.selectedScrollSnap());

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await api.get<{ success: boolean; data?: { products: Product[] } }>('/products?limit=12');
        const products = response?.data?.products || (Array.isArray((response as any)?.products) ? (response as any).products : []);
        setFeaturedProducts(products);
        setProductError(null);
      } catch (error) {
        setProductError(getErrorMessage(error, 'Unable to load products.'));
      } finally {
        setIsLoadingProducts(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await api.get<{ success: boolean; data?: { categories: CategorySummary[] } }>('/categories');
        const fetchedCategories = response?.data?.categories || [];
        setCategorySummaries(fetchedCategories);
        setCategoryError(null);
      } catch (error) {
        setCategoryError(getErrorMessage(error, 'Unable to load categories.'));
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const promotionalBanners = [
    {
      id: 1,
      title: 'Fresh and imported Fruits',
      discount: 'UPTO 40% OFF',
      buttonText: 'Shop now'
    },
    {
      id: 2,
      title: 'Seasonal Specials',
      discount: 'UPTO 50% OFF',
      buttonText: 'Shop now'
    },
    {
      id: 3,
      title: 'Premium Fruits',
      discount: 'UPTO 35% OFF',
      buttonText: 'Shop now'
    },
    {
      id: 4,
      title: 'Weekend Sale',
      discount: 'UPTO 45% OFF',
      buttonText: 'Shop now'
    },
    {
      id: 5,
      title: 'New Arrivals',
      discount: 'UPTO 30% OFF',
      buttonText: 'Shop now'
    }
  ];

  const fallbackProducts: Product[] = [
    {
      _id: 'demo-mango',
      name: 'Mangoes',
      description: 'Fresh Alphonso',
      price: 150,
      originalPrice: 200,
      images: [mangoesImg],
      badge: 'Seasonal'
    },
    {
      _id: 'demo-apple',
      name: 'Apples',
      description: 'Crisp Kashmiri',
      price: 120,
      originalPrice: 160,
      images: [applesImg],
      badge: 'Imported'
    },
    {
      _id: 'demo-strawberry',
      name: 'Strawberries',
      description: 'Sweet & Juicy',
      price: 120,
      originalPrice: 160,
      images: [strawberriesImg],
      badge: 'Imported'
    }
  ];

  const productsToDisplay = featuredProducts.length > 0 ? featuredProducts : fallbackProducts;
  const categoriesToDisplay = categorySummaries.slice(0, 8);

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

        {/* Promotional Banner Carousel */}
        <Carousel setApi={setCarouselApi} className="mb-6">
          <CarouselContent>
            {promotionalBanners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className="bg-gradient-primary rounded-xl p-6 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-2">{banner.title}</h2>
                    <h3 className="text-2xl font-bold mb-4">{banner.discount}</h3>
                    <Button 
                      variant="outline" 
                      className="border-white bg-white !text-primary hover:bg-white/90 hover:!text-primary"
                    >
                      {banner.buttonText}
                    </Button>
                  </div>
                  <div className="absolute right-4 top-4 bottom-4 w-32 bg-white/10 rounded-full"></div>
                  {/* Indicator Dots */}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    {promotionalBanners.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => carouselApi?.scrollTo(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          current === index ? 'bg-white' : 'bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Categories */}
        <div className="mb-6">
          <div className="bg-gradient-primary rounded-lg px-4 py-3 flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Categories</h3>
            <button 
              onClick={() => navigate('/categories')}
              className="text-white font-medium hover:text-white/80"
            >
              See all
            </button>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {isLoadingCategories ? (
              <p className="text-sm text-gray-600 px-2">Loading categories...</p>
            ) : categoriesToDisplay.length === 0 ? (
              <p className="text-sm text-gray-600 px-2">
                {categoryError || 'No categories available yet.'}
              </p>
            ) : (
              categoriesToDisplay.map((category, index) => (
                <div key={`${category.slug}-${index}`} className="flex flex-col items-center min-w-[100px]">
                  <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center text-2xl font-semibold text-primary mb-2 shadow-sm">
                    {category.icon || category.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-center text-gray-700 font-medium">
                    {category.name}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {category.description?.slice(0, 28) || 'Tap to explore'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Seasonal Specials */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Seasonal Specials</h3>
            <button className="text-primary font-medium">See all</button>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {isLoadingProducts ? (
              <div className="text-sm text-gray-600 px-2">Loading products...</div>
            ) : (
              productsToDisplay.map((item) => (
                <div 
                  key={item._id} 
                  className="min-w-[160px] bg-white rounded-xl shadow-card overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <div className="relative">
                    <img 
                      src={item.images && item.images.length > 0 ? item.images[0] : FALLBACK_IMAGE} 
                      alt={item.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      item.badge?.toLowerCase() === 'seasonal'
                        ? 'bg-orange text-orange-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      {item.badge || 'Fresh'}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900">₹{item.price}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-gray-500 line-through ml-1">₹{item.originalPrice}</span>
                        )}
                      </div>
                      <Button variant="fab" size="xs">
                        <span className="text-sm font-bold">+</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {productError && featuredProducts.length === 0 && !isLoadingProducts && (
            <p className="text-xs text-red-600 mt-2">{productError}</p>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;
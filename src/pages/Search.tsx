import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import mangoesImg from '@/assets/mangoes.jpg';
import applesImg from '@/assets/apples.jpg';
import strawberriesImg from '@/assets/strawberries.jpg';
import orangesImg from '@/assets/oranges.jpg';
import grapesImg from '@/assets/grapes.png';

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const allProducts = [
    { id: '1', name: 'Fresh Mangoes', category: 'tropical', price: 150, image: mangoesImg, badge: 'Seasonal' },
    { id: '2', name: 'Red Apples', category: 'temperate', price: 120, image: applesImg, badge: 'Imported' },
    { id: '3', name: 'Strawberries', category: 'berries', price: 180, image: strawberriesImg, badge: 'Premium' },
    { id: '4', name: 'Valencia Oranges', category: 'citrus', price: 80, image: orangesImg, badge: 'Fresh' },
    { id: '5', name: 'Green Grapes', category: 'grapes', price: 200, image: grapesImg, badge: 'Imported' }
  ];

  const categories = [
    { key: 'all', label: 'All Fruits' },
    { key: 'tropical', label: 'Tropical' },
    { key: 'temperate', label: 'Temperate' },
    { key: 'citrus', label: 'Citrus' },
    { key: 'berries', label: 'Berries' },
    { key: 'grapes', label: 'Grapes' }
  ];

  const priceRanges = [
    { key: 'all', label: 'All Prices' },
    { key: '0-100', label: 'Under ₹100' },
    { key: '100-150', label: '₹100 - ₹150' },
    { key: '150-200', label: '₹150 - ₹200' },
    { key: '200+', label: 'Above ₹200' }
  ];

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(p => p.replace('+', ''));
      if (max) {
        matchesPrice = product.price >= parseInt(min) && product.price <= parseInt(max);
      } else {
        matchesPrice = product.price >= parseInt(min);
      }
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const recentSearches = ['Mangoes', 'Organic Apples', 'Fresh Berries', 'Citrus Fruits'];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search for fruits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted rounded-xl pl-12 pr-12 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card rounded-xl shadow-card p-4 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Filters</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.key}
                      variant={selectedCategory === category.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.key)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Price Range</h4>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => (
                    <Button
                      key={range.key}
                      variant={priceRange === range.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPriceRange(range.key)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {!searchQuery && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => setSearchQuery(search)}
                  className="px-4 py-2 bg-muted rounded-full text-sm text-foreground hover:bg-muted/80 transition-colors duration-300"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-4">
            <p className="text-muted-foreground">
              {filteredProducts.length} results for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-card rounded-xl shadow-card overflow-hidden cursor-pointer hover:shadow-hover transition-all duration-300 animate-slide-up"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-32 object-cover"
                />
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${
                  product.badge === 'Seasonal' ? 'bg-orange/80 text-white' : 
                  product.badge === 'Imported' ? 'bg-destructive/80 text-white' :
                  product.badge === 'Premium' ? 'bg-primary/80 text-white' :
                  'bg-success/80 text-white'
                }`}>
                  {product.badge}
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-foreground mb-1">{product.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">₹{product.price}</span>
                  <Button variant="fab" size="xs">
                    <span className="text-sm font-bold">+</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {searchQuery && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-4">
              <SearchIcon className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Try adjusting your search terms or filters to find what you're looking for
            </p>
            <Button 
              variant="default"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Search;
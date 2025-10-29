import { Heart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import mangoesImg from '@/assets/mangoes.jpg';
import applesImg from '@/assets/apples.jpg';
import strawberriesImg from '@/assets/strawberries.jpg';
import orangesImg from '@/assets/oranges.jpg';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([
    {
      id: '1',
      name: 'Fresh Mangoes',
      description: 'Sweet Alphonso variety',
      price: 150,
      image: mangoesImg,
      badge: 'Seasonal'
    },
    {
      id: '2',
      name: 'Red Apples',
      description: 'Crisp Kashmiri apples',
      price: 120,
      image: applesImg,
      badge: 'Imported'
    },
    {
      id: '4',
      name: 'Fresh Oranges',
      description: 'Juicy Valencia oranges',
      price: 80,
      image: orangesImg,
      badge: 'Fresh'
    }
  ]);

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Favorites</h1>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Heart className="w-5 h-5 fill-current text-destructive" />
            <span className="text-sm">{favorites.length} items</span>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Favorites Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Start adding your favorite fruits to quickly access them here
            </p>
            <Button onClick={() => navigate('/')} variant="default">
              Browse Fruits
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((item) => (
              <div key={item.id} className="bg-card rounded-xl shadow-card p-4 animate-slide-up">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.badge === 'Seasonal' ? 'bg-orange/20 text-orange' : 
                        item.badge === 'Imported' ? 'bg-destructive/20 text-destructive' :
                        'bg-success/20 text-success'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">₹{item.price}</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/product/${item.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFavorite(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Favorites;
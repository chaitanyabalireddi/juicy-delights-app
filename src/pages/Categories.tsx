import BottomNavigation from '@/components/BottomNavigation';
import { ChevronRight } from 'lucide-react';
import orangesImg from '@/assets/oranges.jpg';

const Categories = () => {
  const categories = [
    {
      title: 'Exotic festival',
      bgColor: 'bg-primary',
      items: [
        { name: 'Exotic Litchi', icon: '🍇' },
        { name: 'Exotic Dragon fruit', icon: '🐉' },
        { name: 'Imported peaches', icon: '🍑' },
        { name: 'Imported Mango', icon: '🥭' },
        { name: 'Imported Apples', icon: '🍎' },
      ]
    },
    {
      title: 'Desi Fruits',
      bgColor: 'bg-orange',
      items: [
        { name: 'Sitaphal', icon: '🍈' },
        { name: 'Ice apple', icon: '🧊' },
        { name: 'Guavas', icon: '🍐' },
        { name: 'Pineapple', icon: '🍍' },
        { name: 'Jamun', icon: '🫐' },
        { name: 'Mangoes', icon: '🥭' },
      ]
    },
    {
      title: 'Citrus Fruits',
      bgColor: 'bg-primary',
      items: [
        { name: 'Oranges', icon: '🍊', image: orangesImg },
        { name: 'Oranges', icon: '🍊' },
        { name: 'Oranges', icon: '🍊' },
        { name: 'Oranges', icon: '🍊' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-center">Categories</h1>
      </div>

      <div className="px-4 py-4 space-y-6">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            {/* Category Header */}
            <div className={`${category.bgColor} text-white rounded-lg px-4 py-3 flex items-center justify-between mb-4`}>
              <h2 className="text-lg font-semibold">{category.title}</h2>
              <ChevronRight size={20} />
            </div>

            {/* Category Items Grid */}
            <div className="grid grid-cols-3 gap-4">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      item.icon
                    )}
                  </div>
                  <span className="text-sm text-center text-gray-700 font-medium">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Categories;
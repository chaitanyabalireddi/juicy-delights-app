import { User, Settings, MapPin, CreditCard, HelpCircle, LogOut, Package, Bell, Shield, LogIn, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const profileItems = [
    { icon: Package, label: 'My Orders', value: '3 recent orders', path: '/orders' },
    { icon: MapPin, label: 'My Addresses', value: '2 saved addresses' },
    { icon: CreditCard, label: 'Payment Methods', value: '1 card added' },
    { icon: Bell, label: 'Notifications', value: 'Manage alerts' },
    { icon: Settings, label: 'Settings', value: 'Preferences' },
    { icon: HelpCircle, label: 'Help & Support', value: 'Get assistance' },
  ];

  // Add admin items if user is admin
  if (isAdmin) {
    profileItems.unshift(
      { icon: Shield, label: 'Admin Dashboard', value: 'Manage orders & stock', path: '/admin/orders' },
      { icon: Package, label: 'Stock Management', value: 'Update inventory', path: '/admin/stock' },
      { icon: Building2, label: 'Pickup Warehouses', value: 'Manage pickup locations', path: '/admin/warehouses' }
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <div className="px-4 py-6">
        {/* User Profile Card */}
        <div className="bg-gradient-primary rounded-2xl p-6 text-center text-white mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">{user?.name || 'Guest User'}</h2>
            <p className="text-white/90 mb-4">{user?.email || 'Not logged in'}</p>
            {isAdmin && (
              <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                Admin
              </div>
            )}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="text-center">
                <p className="font-bold">12</p>
                <p className="text-white/80">Orders</p>
              </div>
              <div className="text-center">
                <p className="font-bold">₹2,450</p>
                <p className="text-white/80">Saved</p>
              </div>
              <div className="text-center">
                <p className="font-bold">Gold</p>
                <p className="text-white/80">Member</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>

        {/* Profile Options */}
        <div className="space-y-3">
          {profileItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.path && navigate(item.path)}
              className="flex items-center justify-between p-4 bg-card rounded-xl shadow-card hover:shadow-hover transition-all duration-300 w-full text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </div>
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="text-xs">›</span>
              </div>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        {user && (
          <div className="mt-8">
            <Button 
              variant="outline" 
              className="w-full text-destructive border-destructive hover:bg-destructive hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        )}
        
        {!user && (
          <div className="mt-8">
            <Button 
              className="w-full bg-gradient-primary text-primary-foreground"
              onClick={() => navigate('/login')}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
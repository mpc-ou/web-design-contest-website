import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { SunIcon, MoonIcon, Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import NotificationPopup from './NotificationPopup';

const Navbar = () => {
  const { currentUser, userInfo, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Theo dõi scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.getNotifications({
        onlyUnread: 'true',
        limit: 1
      });
      setUnreadCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const menuItems = [
    { text: 'Trang chủ', path: '/' },
    { text: 'Cuộc thi', path: '/contests' },
    { text: 'Triển lãm', path: '/exhibitions' },
    { text: 'Đội thi', path: '/teams' },
    { text: 'Minigames', path: '/minigames' },
  ];

  return (
    <>
      <header className={`
        sticky top-0 z-50 w-full border-b transition-all duration-300 ease-in-out
        ${isScrolled 
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm' 
          : 'bg-transparent backdrop-blur-none border-transparent'
        }
      `}>
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              {/* <span className="hidden font-bold sm:inline-block text-xl">
                Web Design Contest
              </span> */}
              <img src="/img/logo.png" alt="Web Design Contest" width={100} />
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {item.text}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link
                to="/"
                className="flex items-center"
                onClick={() => setIsOpen(false)}
              >
                {/* <span className="font-bold">Web Design Contest</span> */}
                <img src="/img/logo.png" alt="Web Design Contest" width={100} />
              </Link>
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      {item.text}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Link to="/" className="md:hidden">
                <span className="font-bold">Web Design Contest</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-2">
              {/* Notifications */}
              {currentUser && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <BellIcon className="h-[1.2rem] w-[1.2rem]" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                    <span className="sr-only">Thông báo</span>
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
              >
                <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <Link to="/profile" className="hidden sm:flex items-center space-x-2">
                    <img 
                      src={userInfo?.avatar || '/img/default-avatar.png'} 
                      alt={userInfo?.lastName || currentUser.email} 
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="text-sm hidden sm:block">
                      {userInfo?.lastName || currentUser.email}
                    </span>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <Button asChild size="sm">
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Notification Popup */}
      <NotificationPopup 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
};

export default Navbar;
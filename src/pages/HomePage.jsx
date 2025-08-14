import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { toast } from 'sonner';

// Import components
import HeroSection from '../components/home/HeroSection';
import CurrentContestSection from '../components/home/CurrentContestSection';
import IntroductionSection from '../components/home/IntroductionSection'; // New
import ContestsGrid from '../components/home/ContestsGrid';
import ExhibitionSection from '../components/home/ExhibitionSection';
import SponsorsSection from '../components/home/SponsorsSection'; // New
import GallerySection from '../components/home/GallerySection';
import FeaturesSection from '../components/home/FeaturesSection';
import CTASection from '../components/home/CTASection';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const [contests, setContests] = useState([]);
  const [currentContest, setCurrentContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contests from real API
        const contestResponse = await apiService.getContests();
        const contestsData = contestResponse.data.data || [];
        setContests(contestsData);
        
        // Set the first active contest as current contest
        const activeContest = contestsData.find(contest => 
          contest.status === 'active' || contest.isActive
        ) || contestsData[0];
        
        if (activeContest) {
          setCurrentContest(activeContest);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setCurrentContest(null);
        toast.error('Không thể tải dữ liệu trang chủ');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroSection 
        imageUrl="/img/bg2.jpg"
        title="Web Design Contest"
        description="Một cuộc thi thiết kế web dành cho sinh viên trường Đại học Mở TPHCM do CLB Lập trình trên thiết bị di động tổ chức"
        buttonComponents={(
          <>
            <Button size="lg" asChild>
              <Link to="/contests">
                Khám phá cuộc thi
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {user && (
              <Button size="lg" asChild>
                <Link to="/login">
                  Đăng nhập
                </Link>
              </Button>
            )}
          </>
        )}
      />
      <CurrentContestSection contest={currentContest} />
      <IntroductionSection /> 
      <GallerySection />
      {/* <ContestsGrid contests={contests} /> */}
      <ExhibitionSection />
      <FeaturesSection />
      <CTASection />
      <SponsorsSection /> 
    </div>
  );
};

export default HomePage;
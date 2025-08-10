import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  ArrowRightIcon,
  LinkIcon 
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import { toast } from 'sonner';

const SponsorsSection = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const response = await apiService.getSponsors();
      const sponsorsData = response.data.data || [];
      
      // Lấy 10 nhà tài trợ đầu tiên, ưu tiên theo tier và isPublic
      const filteredSponsors = sponsorsData
        .filter(sponsor => sponsor.isActive && sponsor.isPublic)
        .sort((a, b) => {
          // Sắp xếp theo tier priority
          const tierPriority = {
            'Diamond': 1,
            'Platinum': 2, 
            'Gold': 3,
            'Silver': 4,
            'Bronze': 5,
            'Supporter': 6
          };
          
          const aPriority = tierPriority[a.tier] || 999;
          const bPriority = tierPriority[b.tier] || 999;
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          // Nếu cùng tier, sắp xếp theo priority number
          return (a.priority || 999) - (b.priority || 999);
        })
        .slice(0, 10); // Lấy 10 đầu tiên
        
      setSponsors(filteredSponsors);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      // Don't show error toast for sponsors as it's not critical
    } finally {
      setLoading(false);
    }
  };

  const handleSponsorClick = (sponsor) => {
    if (sponsor.website) {
      // Mở trang web của nhà tài trợ trong tab mới
      window.open(sponsor.website, '_blank', 'noopener,noreferrer');
    }
  };

  const getTierBadgeColor = (tier) => {
    const colors = {
      'Diamond': 'bg-purple-100 text-purple-800 border-purple-200',
      'Platinum': 'bg-gray-100 text-gray-800 border-gray-200',
      'Gold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Silver': 'bg-slate-100 text-slate-800 border-slate-200',
      'Bronze': 'bg-amber-100 text-amber-800 border-amber-200',
      'Supporter': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nhà tài trợ</h2>
            <div className="w-20 h-1 bg-primary rounded-full mx-auto"></div>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, index) => (
              <Card key={index} className="aspect-square">
                <CardContent className="p-6 flex items-center justify-center h-full">
                  <div className="w-full h-16 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (sponsors.length === 0) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nhà tài trợ</h2>
            <div className="w-20 h-1 bg-primary rounded-full mx-auto"></div>
          </div>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <BuildingOfficeIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Chưa có nhà tài trợ</h3>
              <p className="text-muted-foreground mb-4">
                Chúng tôi đang tìm kiếm các đối tác tài trợ cho cuộc thi
              </p>
              <Button variant="outline" asChild>
                <Link to="/sponsors">
                  Trở thành nhà tài trợ
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nhà tài trợ
            <span className="text-primary"> & Đối tác</span>
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi tự hào có sự đồng hành của các nhà tài trợ và đối tác uy tín, 
            góp phần tạo nên thành công cho cuộc thi Web Design Contest.
          </p>
        </div>

        {/* Sponsors Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {sponsors.map((sponsor, index) => (
            <Card 
              key={sponsor._id || index}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-background border-2 hover:border-primary/20 ${
                sponsor.website ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => handleSponsorClick(sponsor)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[120px] relative">
                {/* Tier badge */}
                {sponsor.tier && (
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium border ${getTierBadgeColor(sponsor.tier)}`}>
                    {sponsor.tier}
                  </div>
                )}

                {/* Logo */}
                <div className="flex-1 flex items-center justify-center w-full">
                  {sponsor.logo ? (
                    <img
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      className="max-w-full max-h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to company name if logo fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Fallback text (hidden by default) */}
                  <div className="hidden flex-col items-center justify-center text-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium text-foreground line-clamp-2">
                      {sponsor.name}
                    </span>
                  </div>
                </div>

                {/* Company name - shown on hover or if no logo */}
                <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs font-medium text-foreground line-clamp-2">
                    {sponsor.name}
                  </p>
                </div>

                {/* External link indicator */}
                {sponsor.website && (
                  <LinkIcon className="absolute bottom-2 right-2 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {sponsors.length}
                </div>
                <p className="text-sm text-muted-foreground">Nhà tài trợ tin tưởng</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {sponsors.filter(s => ['Diamond', 'Platinum', 'Gold'].includes(s.tier)).length}
                </div>
                <p className="text-sm text-muted-foreground">Đối tác chiến lược</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">5+</div>
                <p className="text-sm text-muted-foreground">Năm hợp tác</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/sponsors">
                Xem tất cả nhà tài trợ
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/sponsors#contact">
                Trở thành nhà tài trợ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
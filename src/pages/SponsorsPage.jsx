import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  BuildingOfficeIcon, 
  HeartIcon, 
  EnvelopeIcon,
  StarIcon,
  SparklesIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { sponsorBenefits, sponsorNotes } from '../constants/sponsorBenefits';

const SponsorsPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSponsors();
      setSponsors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      setError('Không thể tải danh sách nhà tài trợ');
    } finally {
      setLoading(false);
    }
  };

  const getTierConfig = (tier) => {
    const configs = {
      Diamond: {
        name: 'Kim cương',
        borderColor: 'border-cyan-400',
        bgColor: 'border-cyan-400/20',
        priority: 1
      },
      Platinum: {
        name: 'Bạch kim',
        borderColor: 'border-gray-400',
        bgColor: 'border-gray-400/20',
        priority: 2
      },
      Gold: {
        name: 'Vàng',
        borderColor: 'border-yellow-400',
        bgColor: 'border-yellow-400/20',
        priority: 3
      },
      Silver: {
        name: 'Bạc',
        borderColor: 'border-gray-400',
        bgColor: 'border-gray-400/20',
        priority: 4
      },
      Bronze: {
        name: 'Đồng',
        borderColor: 'border-amber-600',
        bgColor: 'border-amber-600/20',
        priority: 5
      },
      Supporter: {
        name: 'Hỗ trợ',
        borderColor: 'border-green-400',
        bgColor: 'border-green-400/20',
        priority: 6
      }
    };
    return configs[tier] || configs.Bronze;
  };

  // Sort sponsors by tier priority
  const sortedSponsors = sponsors.sort((a, b) => {
    const tierA = getTierConfig(a.currentTier);
    const tierB = getTierConfig(b.currentTier);
    return tierA.priority - tierB.priority;
  });

  const getParticipationYears = (sponsor) => {
    if (!sponsor.sponsorshipHistory || sponsor.sponsorshipHistory.length === 0) return '';
    const years = sponsor.sponsorshipHistory.map(h => h.year).sort((a, b) => b - a);
    if (years.length === 1) return years[0];
    return `${Math.min(...years)} - ${Math.max(...years)}`;
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Nhà tài trợ</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Chúng tôi trân trọng sự đồng hành và hỗ trợ của các nhà tài trợ trong việc tổ chức 
            cuộc thi Web Design Contest, tạo cơ hội học tập và phát triển cho sinh viên, học sinh.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg text-center">
            {error}
          </div>
        )}

        {sponsors.length === 0 && !loading ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có nhà tài trợ nào</h3>
            <p className="text-muted-foreground">Thông tin nhà tài trợ sẽ được cập nhật sớm nhất</p>
          </div>
        ) : (
          /* Sponsors Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {sortedSponsors.map((sponsor) => {
              const tierConfig = getTierConfig(sponsor.currentTier);
              const participationYears = getParticipationYears(sponsor);

              return (
                <Card 
                  key={sponsor.id} 
                  className={`transition-all duration-300 hover:shadow-lg border-2 ${tierConfig.borderColor} ${tierConfig.bgColor}`}
                >
                  <CardContent className="p-6">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                      {sponsor.logo ? (
                        <img
                          src={sponsor.logo}
                          alt={`${sponsor.name} logo`}
                          className="h-16 w-auto object-contain"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                          <BuildingOfficeIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Sponsor Info */}
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-2">{sponsor.name}</h3>
                      
                      {/* Tier Badge */}
                      <Badge 
                        variant="outline" 
                        className={`mb-3 ${tierConfig.borderColor}`}
                      >
                        {tierConfig.name}
                      </Badge>

                      {/* Participation Years */}
                      {participationYears && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Tham gia: {participationYears}
                        </p>
                      )}

                      {/* Description */}
                      {sponsor.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {sponsor.description}
                        </p>
                      )}

                      {/* Website Link */}
                      {sponsor.website && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" asChild>
                            <a 
                              href={sponsor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs"
                            >
                              Trang web
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Sponsor Benefits Tables */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Quyền lợi nhà tài trợ</h2>
          
          {/* Basic Benefits Table */}
          <Card className="mb-8">
            <CardHeader className="">
              <CardTitle className="text-center text-xl">Quyền lợi nhà tài trợ cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Quyền lợi nhà tài trợ</th>
                      <th className="text-center p-4 font-semibold">Vàng</th>
                      <th className="text-center p-4 font-semibold">Bạc</th>
                      <th className="text-center p-4 font-semibold">Đồng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sponsorBenefits.basic.map((benefit, index) => (
                      <tr key={index} className={`border-b hover:bg-muted/50 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                        <td className="p-4 font-medium">{benefit.category}</td>
                        <td className="p-4 text-center">
                          {typeof benefit.gold === 'boolean' ? (
                            benefit.gold ? <CheckIcon className="h-5 w-5 text-green-600 mx-auto" /> : ''
                          ) : benefit.gold}
                        </td>
                        <td className="p-4 text-center">
                          {typeof benefit.silver === 'boolean' ? (
                            benefit.silver ? <CheckIcon className="h-5 w-5 text-green-600 mx-auto" /> : ''
                          ) : benefit.silver}
                        </td>
                        <td className="p-4 text-center">
                          {typeof benefit.bronze === 'boolean' ? (
                            benefit.bronze ? <CheckIcon className="h-5 w-5 text-green-600 mx-auto" /> : ''
                          ) : benefit.bronze}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Special Benefits Table */}
          <Card className="mb-8">
            <CardHeader className="">
              <CardTitle className="text-center text-xl">Quyền lợi nhà tài trợ đặc biệt</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Quyền lợi nhà tài trợ</th>
                      <th className="text-center p-4 font-semibold">Vàng</th>
                      <th className="text-center p-4 font-semibold">Bạc</th>
                      <th className="text-center p-4 font-semibold">Đồng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sponsorBenefits.special.map((benefit, index) => (
                      <tr key={index} className={`border-b hover:bg-muted/50 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                        <td className="p-4 font-medium">{benefit.category}</td>
                        <td className="p-4 text-center">
                          {typeof benefit.gold === 'boolean' ? (
                            benefit.gold ? <CheckIcon className="h-5 w-5 text-green-600 mx-auto" /> : ''
                          ) : benefit.gold}
                        </td>
                        <td className="p-4 text-center">
                          {typeof benefit.silver === 'boolean' ? (
                            benefit.silver ? <CheckIcon className="h-5 w-5 text-green-600 mx-auto" /> : ''
                          ) : benefit.silver}
                        </td>
                        <td className="p-4 text-center">
                          {typeof benefit.bronze === 'boolean' ? (
                            benefit.bronze ? <CheckIcon className="h-5 w-5 text-green-600 mx-auto" /> : ''
                          ) : benefit.bronze}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-200">Lưu ý quan trọng</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                {sponsorNotes.map((note, index) => (
                  <li key={index}>• <strong>{note.split('.')[0]}.</strong> {note.split('.').slice(1).join('.')}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="text-center py-12">
            <HeartIcon className="h-16 w-16 mx-auto text-primary mb-6" />
            <h2 className="text-2xl font-bold mb-4">Trở thành nhà tài trợ</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Gia nhập cùng chúng tôi trong việc hỗ trợ và phát triển tài năng trẻ trong lĩnh vực 
              thiết kế web. Cơ hội quảng bá thương hiệu và kết nối với sinh viên tài năng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="mailto:it.mpclub@ou.edu.vn">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Liên hệ tài trợ
                </a>
              </Button>
              <Button variant="outline" size="lg">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Tìm hiểu thêm
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-6 md:grid-cols-4 mt-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {sponsors.length}
              </div>
              <p className="text-muted-foreground">Nhà tài trợ</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {sponsors.filter(s => s.currentTier === 'Diamond' || s.currentTier === 'Platinum' || s.currentTier === 'Gold').length}
              </div>
              <p className="text-muted-foreground">Đối tác chính</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Thí sinh tham gia</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">Dự án xuất sắc</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SponsorsPage;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  TrophyIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  useDocumentMeta({
    title: "Câu hỏi thường gặp",
    description: "Tìm câu trả lời cho những thắc mắc phổ biến về cuộc thi"
  });
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = [
    { id: 'all', name: 'Tất cả', icon: QuestionMarkCircleIcon, color: 'bg-blue-500' },
    { id: 'general', name: 'Chung', icon: DocumentTextIcon, color: 'bg-green-500' },
    { id: 'registration', name: 'Đăng ký', icon: UsersIcon, color: 'bg-purple-500' },
    { id: 'contest', name: 'Cuộc thi', icon: TrophyIcon, color: 'bg-yellow-500' },
    { id: 'technical', name: 'Kỹ thuật', icon: ComputerDesktopIcon, color: 'bg-red-500' },
    { id: 'schedule', name: 'Lịch trình', icon: CalendarIcon, color: 'bg-indigo-500' }
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFAQs();
      const faqs = response.data.data || [];
      
      // Sort by order and then by creation date
      const sortedFaqs = faqs.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      setFaqData(sortedFaqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setError('Không thể tải danh sách câu hỏi thường gặp');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqData.filter(item => {
    // Only show active FAQs
    if (!item.isActive) return false;
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Câu hỏi thường gặp</h1>
          <p className="text-xl text-muted-foreground">
            Tìm câu trả lời cho những thắc mắc phổ biến về cuộc thi
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Danh mục</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`gap-2 ${isSelected ? '' : 'hover:bg-muted'}`}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {category.id === 'all' 
                      ? faqData.filter(item => item.isActive).length 
                      : faqData.filter(item => item.category === category.id && item.isActive).length
                    }
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        {searchTerm && (
          <div className="mb-4">
            <p className="text-muted-foreground">
              Tìm thấy {filteredFAQs.length} câu hỏi
            </p>
          </div>
        )}

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item) => (
              <Card key={item._id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpanded(item._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium text-left">
                        {item.question}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {expandedItems.has(item._id) ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {expandedItems.has(item._id) && (
                  <CardContent className="pt-0">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <QuestionMarkCircleIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {error ? 'Có lỗi xảy ra' : 'Không tìm thấy câu hỏi nào'}
                </h3>
                <p className="text-muted-foreground text-center">
                  {error ? 'Vui lòng thử lại sau' : 'Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác'}
                </p>
                {!error && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="mt-4"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
                {error && (
                  <Button 
                    variant="outline" 
                    onClick={fetchFAQs}
                    className="mt-4"
                  >
                    Thử lại
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Info */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Không tìm thấy câu trả lời?</CardTitle>
            <CardDescription>
              Nếu bạn có thắc mắc khác, hãy liên hệ với chúng tôi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Email hỗ trợ</h4>
                <p className="text-muted-foreground">it.mpclub@ou.edu.vn</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Fanpage Facebook</h4>
                <p className="text-muted-foreground">fb.com/CLBLapTrinhTrenThietBiDiDong</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;
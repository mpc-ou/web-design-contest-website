import { Card, CardTitle, CardDescription } from '../ui/card';
import { CalendarIcon, TrophyIcon, UsersIcon } from '@heroicons/react/24/outline';

const FeaturesSection = () => {
  const features = [
    {
      icon: TrophyIcon,
      title: "Giải thưởng hấp dẫn",
      description: "Cơ hội nhận được những phần thưởng giá trị và tiếp cận với các nhà tuyển dụng hàng đầu"
    },
    {
      icon: UsersIcon,
      title: "Cộng đồng sôi động",
      description: "Kết nối với các sinh viên IT với nhau, cùng nhau học hỏi và phát triển"
    },
    {
      icon: CalendarIcon,
      title: "Tích lũy kinh nghiệm",
      description: "Nâng cao kỹ năng thiết kế web qua các thử thách thực tế và phản hồi từ các thầy cô và cố vấn chuyên nghiệp"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tại sao chọn chúng tôi?</h2>
          <p className="text-xl text-muted-foreground">Những điều đặc biệt khi tham gia cuộc thi</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="text-center p-6">
                <IconComponent className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle className="mb-2">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
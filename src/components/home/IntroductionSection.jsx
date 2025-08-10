import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { 
  CodeBracketIcon, 
  AcademicCapIcon, 
  UserGroupIcon,
  TrophyIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const IntroductionSection = () => {
  const features = [
    {
      icon: CodeBracketIcon,
      title: "Nâng cao kỹ năng lập trình",
      description: "Phát triển khả năng lập trình ứng dụng thực tế với các công nghệ web hiện đại"
    },
    {
      icon: AcademicCapIcon,
      title: "Trải nghiệm kiến thức mới",
      description: "Tiếp cận và thử thách bản thân với những kiến thức và công nghệ mới mẻ"
    },
    {
      icon: UserGroupIcon,
      title: "Làm việc nhóm hiệu quả",
      description: "Rèn luyện kỹ năng làm việc nhóm và quản lý dự án trong môi trường thực tế"
    },
    {
      icon: TrophyIcon,
      title: "Sân chơi học thuật",
      description: "Tham gia cuộc thi học thuật đầy ý nghĩa và sáng tạo cùng sinh viên IT"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Giới thiệu cuộc thi
                <span className="text-primary"> Web Design</span>
              </h2>
              <div className="w-20 h-1 bg-primary rounded-full"></div>
            </div>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                <strong className="text-foreground">Web Design</strong> là một cuộc thi lập trình giao diện Website được tổ chức thường niên bởi 
                <strong className="text-primary"> Câu lạc bộ Lập Trình Trên Thiết Bị Di Động</strong> với mong muốn mang đến với các bạn sinh viên đam mê công nghệ thông tin một sân chơi học thuật đầy ý nghĩa và sáng tạo.
              </p>
              
              <p>
                Ở cuộc thi này, các bạn sẽ được nâng cao khả năng lập trình ứng dụng thực tế, thử thách bản thân trải nghiệm những kiến thức mới mẻ và khả năng quản lý dự án đồng thời nâng cao khả năng làm việc nhóm.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex gap-3 p-4 rounded-lg bg-background/60 border border-border/50 hover:border-primary/20 transition-colors"
                >
                  <feature.icon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/contests">
                  Tham gia ngay
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/faq">
                  Tìm hiểu thêm
                </Link>
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://oumpc.github.io/src/asset/image/wd/avatar_wd.jpg"
                alt="Web Design Contest"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              
              {/* Overlay with logo or badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              {/* Floating stats card */}
              {/* <div className="absolute bottom-6 left-6 right-6">
                <Card className="backdrop-blur-sm bg-background/90 border-primary/20">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">500+</div>
                        <div className="text-xs text-muted-foreground">Thí sinh</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">50+</div>
                        <div className="text-xs text-muted-foreground">Dự án</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">5</div>
                        <div className="text-xs text-muted-foreground">Năm tổ chức</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div> */}
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroductionSection;
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const CTASection = () => {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <img
          src="/img/cao.png"
          alt="Bạn đã sẵn sàng?"
          className="w-70 object-cover mb-8 mx-auto"
          loading="lazy"
        />
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Bạn đã sẵn sàng?</h2>
        <p className="text-xl mb-8 opacity-90">
          Tham gia ngay để thể hiện kỹ năng thiết kế web của bạn
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link to="/contests">
            Tham gia ngay
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
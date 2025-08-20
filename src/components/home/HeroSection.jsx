

const HeroSection = ({ imageUrl, title, description, buttonComponents }) => {
  return (
    <section 
        className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "translateY(-65px)",
        }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          {title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {buttonComponents}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
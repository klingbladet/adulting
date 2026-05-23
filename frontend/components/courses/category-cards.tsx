interface CategoryCardProps {
  name: string;
  description?: string;
  logoImage?: string;
  colorClass?: string;
}

const getDarkImage = (img: string) => img.replace('/images/backgrounds/', '/images/backgrounds/mörkt-');

const CategoryCard = ({ name, description, logoImage, colorClass }: CategoryCardProps) => (
  <button
    className={`relative w-full h-full ${colorClass || 'bg-secondary hover:bg-accent'} rounded-xl flex flex-col text-left min-h-[110px] md:min-h-[220px] transition-all overflow-hidden group hover:brightness-95`}
  >
    <div className="relative z-10 p-4 md:p-6 w-full mt-0 flex-grow">
      <h3 className="font-extrabold text-sm md:text-xl mb-1 text-foreground">{name}</h3>
      <p className="text-xs md:text-sm leading-tight text-foreground/80 md:text-muted-foreground">{description}</p>
    </div>
    {logoImage && (
      <div className="absolute bottom-0 right-0 md:bottom-2 md:right-2 p-2">
        <img
          src={logoImage}
          alt=""
          className="dark:hidden w-15 h-15 md:w-24 md:h-24 object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <img
          src={getDarkImage(logoImage)}
          alt=""
          className="hidden dark:block w-20 h-20 md:w-24 md:h-24 object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    )}
  </button>
);

export default CategoryCard
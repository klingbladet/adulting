interface CategoryCardProps {
  name: string;
  description?: string; // optional, manually provided
}

const CategoryCard = ({ name, description }: CategoryCardProps) => (
  <button className="w-full h-full bg-secondary p-4 rounded-xl flex flex-col items-center justify-center text-center min-h-[110px] hover:bg-accent transition-colors">
    <h3 className="font-extrabold text-foreground text-sm mb-1">{name}</h3>
    <p className="text-xs text-muted-foreground leading-tight">{description}</p>
  </button>
);

export default CategoryCard
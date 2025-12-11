import Image from "next/image";

interface CardProps {
  title: string;
  category: string;
  price: string;
  imageUrl: string;
}

export default function Card({ title, category, price, imageUrl }: CardProps) {
  return (
    <div className="group relative flex flex-col gap-4 font-jost">
      {/* Image Container */}
      <div className="aspect-square w-full overflow-hidden rounded-md bg-light-200">
        <Image
          src={imageUrl}
          alt={title}
          width={500}
          height={500}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <h3 className="text-body-medium font-medium text-dark-900 line-clamp-2">
            <a href="#">
                <span aria-hidden="true" className="absolute inset-0" />
                {title}
            </a>
          </h3>
          <p className="text-body-medium font-medium text-dark-900 whitespace-nowrap pl-2">
             ${price}
          </p>
        </div>
        <p className="text-caption text-dark-700">{category}</p>
      </div>
    </div>
  );
}

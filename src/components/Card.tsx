import Image from "next/image";

interface CardProps {
  title: string;
  category: string;
  price: string;
  imageUrl: string;
  colors?: string | null;
}

export default function Card({ title, category, price, imageUrl, colors }: CardProps) {
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

        <div className="flex flex-col gap-1">
          <h3 className="text-body-medium font-medium text-dark-900 line-clamp-2">
            <a href="#">
                <span aria-hidden="true" className="absolute inset-0" />
                {title}
            </a>
          </h3>
          <p className="text-body-medium text-dark-700">{category}</p>
        </div>
          <div className="mb-1">
              {colors && <p className="text-body font-medium text-dark-700">{colors}</p>}
          </div>
        
        <div className="mt-2">
           <p className="text-body-medium font-medium text-dark-900">
             ${price}
          </p>
        </div>
      </div>
    </div>
  );
}


import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Video, Image as ImageIcon, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import React, { type ReactElement } from "react"; // Ensure React is imported

interface ResourceCategory {
  title: string;
  description: string;
  icon: ReactElement;
  link: string;
  iconBgClass: string;
  iconTextClass: string;
}

const resourceCategories: ResourceCategory[] = [
  {
    title: "Documentos PDF",
    description: "Accede a guías, protocolos y documentos esenciales en formato PDF.",
    icon: <FileText className="h-8 w-8" />,
    link: "/resources/pdfs",
    iconBgClass: "bg-red-100 group-hover:bg-red-200",
    iconTextClass: "text-red-600 group-hover:text-red-700"
  },
  {
    title: "Videos Educativos",
    description: "Visualiza tutoriales, conferencias y demostraciones prácticas en video.",
    icon: <Video className="h-8 w-8" />,
    link: "/resources/videos",
    iconBgClass: "bg-blue-100 group-hover:bg-blue-200",
    iconTextClass: "text-blue-600 group-hover:text-blue-700"
  },
  {
    title: "Imágenes Médicas",
    description: "Explora una colección de imágenes, atlas y diagramas médicos.",
    icon: <ImageIcon className="h-8 w-8" />,
    link: "/resources/images",
    iconBgClass: "bg-green-100 group-hover:bg-green-200",
    iconTextClass: "text-green-600 group-hover:text-green-700"
  },
  {
    title: "Artículos y Publicaciones",
    description: "Mantente al día con los últimos artículos, investigaciones y publicaciones.",
    icon: <BookOpen className="h-8 w-8" />,
    link: "/resources/articles",
    iconBgClass: "bg-yellow-100 group-hover:bg-yellow-200",
    iconTextClass: "text-yellow-600 group-hover:text-yellow-700"
  },
];

export default function ResourcesOverviewPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary md:text-5xl">
          Explora Nuestros Recursos Educativos
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
          Encuentra una amplia variedad de materiales cuidadosamente seleccionados para apoyar tu aprendizaje y práctica en atención primaria.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {resourceCategories.map((category) => (
          <Link 
            href={category.link} 
            key={category.title} 
            className="block hover:shadow-2xl transition-all duration-300 rounded-xl cursor-pointer group bg-card hover:border-primary/50 border-transparent border"
          >
            <Card className="flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className={`p-3 rounded-full w-fit mb-4 transition-colors duration-300 ${category.iconBgClass}`}>
                  {React.cloneElement(category.icon, { className: `${category.icon.props.className} ${category.iconTextClass} transition-colors duration-300` })}
                </div>
                <CardTitle className="text-2xl font-bold font-headline text-card-foreground group-hover:text-primary transition-colors duration-300">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </CardContent>
              <CardFooter className="p-6 pt-2">
                <div className="flex items-center text-sm font-semibold text-primary transition-colors duration-300">
                    Explorar {category.title.toLowerCase()}
                    <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

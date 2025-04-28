import React from 'react';
import { Link } from 'wouter';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { MapPin, Phone, Mail } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export default function Footer() {
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 300000, // 5 minutes
  });

  const { data: latestArticles } = useQuery({
    queryKey: ['/api/articles'],
    select: (data) => data.slice(0, 3),
    staleTime: 60000, // 1 minute
  });

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      await apiRequest('POST', '/api/newsletter', data);
      toast({
        title: 'Subscription successful',
        description: 'Thank you for subscribing to our newsletter!',
      });
      reset();
    } catch (error) {
      toast({
        title: 'Subscription failed',
        description: error instanceof Error ? error.message : 'Failed to subscribe to newsletter',
        variant: 'destructive',
      });
    }
  };

  return (
    <footer className="bg-darkText text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-bold font-condensed mb-4">ABOUT US</h4>
            <p className="text-gray-400 text-sm mb-4">
              Daily News delivers timely, accurate reporting on the stories that matter most. 
              Our team of dedicated journalists work around the clock to bring you independent, 
              trustworthy news coverage.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-300"><FaFacebookF /></a>
              <a href="#" className="text-white hover:text-gray-300"><FaTwitter /></a>
              <a href="#" className="text-white hover:text-gray-300"><FaInstagram /></a>
              <a href="#" className="text-white hover:text-gray-300"><FaYoutube /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold font-condensed mb-4">LATEST NEWS</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {latestArticles?.map((article: any) => (
                <li key={article.id} className="pb-3 border-b border-gray-700">
                  <Link href={`/article/${article.slug}`} className="hover:text-white">
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold font-condensed mb-4">CATEGORIES</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {categories?.map((category: any) => (
                <li key={category.id}>
                  <Link href={`/category/${category.slug}`} className="hover:text-white">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold font-condensed mb-4">CONTACT US</h4>
            <address className="text-sm text-gray-400 not-italic">
              <p className="mb-2"><MapPin className="inline mr-2 h-4 w-4" /> 123 News Street, Cityville</p>
              <p className="mb-2"><Phone className="inline mr-2 h-4 w-4" /> (123) 456-7890</p>
              <p className="mb-2"><Mail className="inline mr-2 h-4 w-4" /> contact@dailynews.com</p>
            </address>
            <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  {...register('email')}
                  className="bg-gray-700 text-white rounded-l border-0 focus:ring-0 focus:border-0"
                />
                <Button 
                  type="submit" 
                  className="rounded-l-none" 
                  disabled={isSubmitting}
                >
                  Submit
                </Button>
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </form>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Daily News. All Rights Reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Cookies Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

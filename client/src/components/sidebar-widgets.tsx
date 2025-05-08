import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { FaFacebookF, FaTwitter, FaGoogle, FaPlay } from 'react-icons/fa';
import { formatDateRelative } from '@/lib/utils';
import { ArticleWithDetails, Category } from '@shared/schema';

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to receive emails",
  }),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export function AuthWidget() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  
  if (user) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="font-bold font-condensed text-lg">Welcome, {user.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-3 text-sm">You are logged in and can like articles, leave comments, and more.</p>
          {user.isAdmin && (
            <Button variant="secondary" className="w-full mb-2" onClick={() => navigate('/admin')}>
              Admin Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="font-bold font-condensed text-lg">Account</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-3 text-sm">Sign in to personalize your news feed and save articles.</p>
        <div className="flex space-x-2 mb-3">
          <Button className="flex-1" onClick={() => navigate('/auth')}>Sign In</Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate('/auth?tab=register')}>Register</Button>
        </div>
        {/* <div className="text-center text-sm text-gray-500">
          <span>Or continue with</span>
          <div className="flex justify-center space-x-3 mt-2">
            <Button variant="outline" size="icon" className="rounded-full bg-[#3b5998] text-white hover:bg-[#3b5998]/90">
              <FaFacebookF className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full bg-[#1da1f2] text-white hover:bg-[#1da1f2]/90">
              <FaTwitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full bg-[#db4437] text-white hover:bg-[#db4437]/90">
              <FaGoogle className="h-4 w-4" />
            </Button>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}

export function PopularArticlesWidget() {
  const { data: articles = [], isLoading } = useQuery<ArticleWithDetails[]>({
    queryKey: ['/api/articles/popular'],
    staleTime: 300000, // 5 minutes
  });
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="font-bold font-condensed text-lg">MOST READ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start">
                <div className="text-2xl font-bold text-primary mr-3 font-condensed">{i+1}</div>
                <div className="w-full">
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (articles.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="font-bold font-condensed text-lg">MOST READ</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {articles.map((article, index) => (
            <li key={article.id} className="flex items-start">
              <span className="text-2xl font-bold text-primary mr-3 font-condensed">{index + 1}</span>
              <div>
                <h4 className="font-bold font-condensed text-sm">
                  <Link href={`/article/${article.slug}`}>{article.title}</Link>
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {article.createdAt && formatDateRelative(article.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export function CategoryWidget() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    staleTime: 600000, // 10 minutes
  });
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="font-bold font-condensed text-lg">CATEGORIES</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded-full w-8"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!categories || categories.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="font-bold font-condensed text-lg">CATEGORIES</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {categories.map((category: any) => (
            <li key={category.id} className="flex justify-between items-center">
              <Link href={`/category/${category.slug}`} className="text-darkText hover:text-primary">
                {category.name}
              </Link>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                {category.articleCount || '0'}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function NewsletterWidget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      agreeTerms: false,
    }
  });
  
  const newsletterMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest('POST', '/api/newsletter', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Thank you for subscribing to our newsletter.',
      });
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Subscription failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const onSubmit = (data: NewsletterFormData) => {
    const { email } = data;
    newsletterMutation.mutate({ email });
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="font-bold font-condensed text-lg">NEWSLETTER</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-3 text-sm">Stay updated with our daily digest of top stories.</p>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="email"
            placeholder="Your email address"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
          
          <div className="flex items-start space-x-2">
            <Checkbox id="newsletter-terms" {...register('agreeTerms')} />
            <Label htmlFor="newsletter-terms" className="text-xs text-gray-500">
              I agree to receive news and promotional emails
            </Label>
          </div>
          {errors.agreeTerms && (
            <p className="text-red-500 text-xs">{errors.agreeTerms.message}</p>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={newsletterMutation.isPending}
          >
            Subscribe
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdvertisementWidget({ size = "medium" }) {
  return (
    <div className="bg-gray-200 rounded-md p-3 text-center mb-6">
      <div className="border border-dashed border-gray-400 py-12 px-4">
        <p className="text-gray-500 font-bold">ADVERTISEMENT</p>
        <p className="text-gray-500 text-sm">
          {size === "large" ? "728x90 Ad" : "300x250 Ad"}
        </p>
      </div>
    </div>
  );
}

export function FeaturedVideoWidget() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="font-bold font-condensed text-lg">FEATURED VIDEO</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1460574283810-2aab119d8511?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
            alt="Featured video thumbnail" 
            className="w-full h-48 object-cover rounded"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="default" size="icon" className="rounded-full w-16 h-16">
              <FaPlay className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <h4 className="font-bold font-condensed text-sm mt-3">
          Behind the Scenes: The Making of a Global News Network
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          2 days ago
        </p>
      </CardContent>
    </Card>
  );
}

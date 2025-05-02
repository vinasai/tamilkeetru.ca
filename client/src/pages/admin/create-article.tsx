import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category, Article, insertArticleSchema, User } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Extend the insert schema with client-side validations
const formSchema = insertArticleSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must not exceed 100 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters").max(250, "Excerpt must not exceed 250 characters"),
  coverImage: z.string().url("Cover image must be a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateArticle() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const editorRef = useRef<any>(null);

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch users for author selection
  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: user?.isAdmin // Only load users if current user is admin
  });

  // Fetch article data if in edit mode
  const { data: article, isLoading: isArticleLoading } = useQuery<Article>({
    queryKey: [`/api/articles/${id}`],
    enabled: isEditMode,
    refetchOnMount: true,
    staleTime: 0 // Consider data stale immediately
  });

  useEffect(() => {
    if (article) {
      console.log("Loaded article:", article);
    }
  }, [article]);



  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      coverImage: "",
      categoryId: 0,
      authorId: user?.id || 0,
      isFeatured: false,
      isBreaking: false,
    },
  });

  // Set form values when article data is loaded in edit mode
  useEffect(() => {
    if (isEditMode && article) {
      form.reset({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        categoryId: article.categoryId,
        authorId: article.authorId,
        isFeatured: article.isFeatured,
        isBreaking: article.isBreaking,
      });
    }
  }, [article, form, isEditMode]);

  // Generate slug from title
  const generateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
      form.setValue("slug", slug);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditMode && article) {
        // Update existing article
        await apiRequest("PATCH", `/api/articles/${article.id}`, values);
        toast({
          title: "Article updated",
          description: "The article has been successfully updated.",
        });
        
        // Invalidate the specific article query
        queryClient.invalidateQueries({ queryKey: [`/api/articles/${article.id}`] });
      } else {
        // Create new article
        await apiRequest("POST", "/api/articles", values);
        toast({
          title: "Article created",
          description: "The article has been successfully created.",
        });
      }
      
      // Invalidate all article-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/breaking"] });
      
      // Navigate back to articles list
      navigate("/admin/articles");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save article",
        variant: "destructive",
      });
    }
  };

  if (isCategoriesLoading || (isEditMode && isArticleLoading) || (user?.isAdmin && isUsersLoading)) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList className="flex-wrap text-sm md:text-base">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Dashboard Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Article</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-['Roboto_Condensed']">
          {isEditMode ? "Edit Article" : "Create New Article"}
        </h1>
        <Button 
          variant="outline" 
          onClick={() => navigate("/admin/articles")}
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Articles
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Article" : "Create New Article"}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Update the details of an existing article" 
              : "Fill in the details to create a new article"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Article title" {...field} />
                      </FormControl>
                      <FormDescription>
                        The title of your article
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="article-slug" {...field} />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={generateSlug}
                        >
                          Generate
                        </Button>
                      </div>
                      <FormDescription>
                        URL-friendly version of the title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief summary of the article" 
                        {...field} 
                        rows={2}
                      />
                    </FormControl>
                    <FormDescription>
                      A short summary shown in article lists (20-250 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        initialValue={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        placeholder="Full article content"
                      />
                    </FormControl>
                    <FormDescription>
                      The full content of your article
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      URL to the main image for this article
                    </FormDescription>
                    <FormMessage />
                    {field.value && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Preview:</p>
                        <img 
                          src={field.value} 
                          alt="Cover preview" 
                          className="max-h-40 rounded border"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                          }}
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value ? field.value.toString() : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem 
                              key={category.id} 
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        {user?.isAdmin ? (
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value ? field.value.toString() : user?.id?.toString()}
                            defaultValue={user?.id?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an author" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users?.map((author) => (
                                <SelectItem 
                                  key={author.id} 
                                  value={author.id.toString()}
                                >
                                  {author.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input 
                            value={user?.username || ""} 
                            disabled 
                          />
                        )}
                      </FormControl>
                      <FormDescription>
                        {user?.isAdmin 
                          ? "Select the author for this article" 
                          : "Articles are published under your username"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-6">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Article</FormLabel>
                        <FormDescription>
                          Display this article in the featured section
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isBreaking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Breaking News</FormLabel>
                        <FormDescription>
                          Mark this article as breaking news
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/admin/articles")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-secondary text-white"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? "Update Article" : "Create Article"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

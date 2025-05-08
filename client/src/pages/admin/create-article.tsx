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
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(50, "Title must not exceed 50 characters (including spaces)"),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z.string()
    .min(20, "Excerpt must be at least 20 characters")
    .max(250, "Excerpt must not exceed 250 characters"),
  coverImage: z.string().url("Cover image must be a valid URL").optional(),
  coverImageFile: z.any().optional(),
  uploadedImage: z.string().optional(),
  categoryId: z.number().min(1, "Please select a category"),
  authorId: z.number().min(1, "Please select an author"),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
}).refine(data => data.coverImage || data.uploadedImage, {
  message: "Either Cover Image URL or Cover Image Upload is required",
  path: ["coverImage"],
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateArticle() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [isImageDimensionWarningVisible, setIsImageDimensionWarningVisible] = useState(false);
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

  // Check image dimensions
  const checkImageDimensions = (url: string) => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      
      // Check if dimensions match recommended size (700px x 384px)
      if (img.width !== 700 || img.height !== 384) {
        setIsImageDimensionWarningVisible(true);
      } else {
        setIsImageDimensionWarningVisible(false);
      }
    };
    img.onerror = () => {
      setImageDimensions(null);
      setIsImageDimensionWarningVisible(false);
    };
    img.src = url;
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a preview URL for the image
    const imageUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imageUrl);
    
    // Set the uploaded image value in the form
    form.setValue("uploadedImage", imageUrl);
    form.setValue("coverImageFile", file);
    
    // Clear the URL input when uploading a file
    form.setValue("coverImage", "");
    
    // Check image dimensions
    checkImageDimensions(imageUrl);
  };
  
  // Remove uploaded image
  const handleRemoveUpload = () => {
    setUploadedImageUrl(null);
    form.setValue("uploadedImage", "");
    form.setValue("coverImageFile", null);
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If user is typing a URL, clear any uploaded image
    if (e.target.value && uploadedImageUrl) {
      handleRemoveUpload();
    }
    
    form.setValue("coverImage", e.target.value);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      coverImage: "",
      uploadedImage: "",
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
        uploadedImage: "",
        categoryId: article.categoryId,
        authorId: article.authorId,
        isFeatured: article.isFeatured,
        isBreaking: article.isBreaking,
      });

      if (article.coverImage) {
        checkImageDimensions(article.coverImage);
      }
    }
  }, [article, form, isEditMode]);

  // Check image dimensions when coverImage URL changes
  const coverImageUrl = form.watch("coverImage");
  useEffect(() => {
    if (coverImageUrl) {
      checkImageDimensions(coverImageUrl);
    }
  }, [coverImageUrl]);

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
      setIsSubmitting(true);
      
      // Create FormData to handle file uploads
      const formData = new FormData();
      
      // Add all form values to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'coverImageFile' && value) {
          formData.append('file', value);
        } else if (key !== 'coverImageFile' && key !== 'uploadedImage' && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      if (isEditMode && article) {
        // Update existing article
        formData.append('id', String(article.id));
        
        const response = await fetch(`/api/articles/${article.id}`, {
          method: 'PATCH',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to update article');
        }
        
        toast({
          title: "Article updated",
          description: "The article has been successfully updated.",
        });
        
        // Invalidate the specific article query
        queryClient.invalidateQueries({ queryKey: [`/api/articles/${article.id}`] });
      } else {
        // Create new article
        const response = await fetch('/api/articles', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to create article');
        }
        
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
    } finally {
      setIsSubmitting(false);
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
            <div className="mb-4 text-sm text-muted-foreground">
              Fields marked with <span className="text-red-500">*</span> are required
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Title <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Article title" {...field} />
                      </FormControl>
                      <FormDescription>
                        The title of your article (maximum 50 characters)
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
                      <FormLabel className="flex items-center">
                        Slug <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
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
                    <FormLabel className="flex items-center">
                      Excerpt <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
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
                    <FormLabel className="flex items-center">
                      Content <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
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

              {/* Cover Image Section */}
              <div className="space-y-4 border p-4 rounded-md bg-gray-50">
                <h3 className="font-medium">Article Cover Image <span className="text-red-500">*</span></h3>
                <p className="text-sm text-muted-foreground">
                  You can either upload an image or provide an image URL.
                  <strong> Recommended dimensions: 700px × 384px</strong>
                </p>
                
                {/* File Upload Option */}
                <div className="space-y-2">
                  <FormLabel>Upload Cover Image</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="flex-1"
                      disabled={!!form.getValues("coverImage")}
                    />
                  </div>
                  {uploadedImageUrl && (
                    <div className="mt-2 flex items-center">
                      <p className="text-xs text-green-600 flex-1">
                        <i className="fas fa-check-circle mr-1"></i> Image uploaded successfully
                      </p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRemoveUpload}
                        className="text-red-500 text-xs h-7"
                      >
                        <i className="fas fa-times mr-1"></i> Remove
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="text-center text-sm text-muted-foreground my-2">- OR -</div>
                
                {/* Image URL Option */}
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
                          onChange={handleUrlChange}
                          disabled={!!uploadedImageUrl}
                        />
                      </FormControl>
                      <FormDescription>
                        Link to an existing image on the web
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Image Preview */}
                {(uploadedImageUrl || coverImageUrl) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-1">Preview:</p>
                    <div className="relative">
                      <img 
                        src={uploadedImageUrl || coverImageUrl} 
                        alt="Cover preview" 
                        className="max-w-full h-auto rounded border aspect-[700/384]"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/700x384?text=Invalid+Image";
                        }}
                      />
                      
                      {/* Image Dimension Warning */}
                      {isImageDimensionWarningVisible && imageDimensions && (
                        <div className="absolute bottom-0 left-0 right-0 bg-amber-500/80 text-white p-2 text-sm">
                          <i className="fas fa-exclamation-triangle mr-1"></i>
                          Warning: Image dimensions ({imageDimensions.width}px × {imageDimensions.height}px) 
                          don't match the recommended size (700px × 384px).
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Category <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
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
                      <FormDescription>
                        Select the category for this article
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Author <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
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

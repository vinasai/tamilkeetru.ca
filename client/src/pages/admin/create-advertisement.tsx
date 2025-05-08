import { useState, useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Define advertisement schema
const adFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  imageUrl: z.string().url("Please enter a valid URL for the image"),
  linkUrl: z.string().url("Please enter a valid URL for the link"),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please enter a valid hex color"),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please enter a valid hex color"),
  position: z.enum(["sidebar", "footer", "article-page", "home-page"]),
  isActive: z.boolean(),
  priority: z.number().int().min(1, "Priority must be at least 1").max(10, "Priority can't be higher than 10"),
  startDate: z.string(),
  endDate: z.string(),
});

type AdFormValues = z.infer<typeof adFormSchema>;

export default function AdvertisementForm() {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [adPreview, setAdPreview] = useState<Partial<AdFormValues> | null>(null);
  
  // Check if we're in edit mode by looking at the route
  const [match, params] = useRoute('/admin/advertisements/edit/:id');
  const isEditMode = match && params?.id;
  const adId = isEditMode ? parseInt(params.id, 10) : undefined;

  // Fetch advertisement data if in edit mode
  const { data: editData, isLoading: isLoadingAd } = useQuery({
    queryKey: [`/api/advertisements/${adId}`],
    queryFn: async () => {
      if (!adId) return null;
      const response = await fetch(`/api/advertisements/${adId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch advertisement");
      }
      return response.json();
    },
    enabled: !!adId, // Only run this query if we have an adId
  });

  // Initialize form
  const form = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      backgroundColor: "#e30613",
      textColor: "#FFFFFF",
      position: "sidebar",
      isActive: true,
      priority: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    },
  });

  // Load edit data into form when available
  useEffect(() => {
    if (editData && isEditMode) {
      // Format dates for date input (YYYY-MM-DD)
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      form.reset({
        title: editData.title,
        description: editData.description,
        imageUrl: editData.imageUrl,
        linkUrl: editData.linkUrl,
        backgroundColor: editData.backgroundColor,
        textColor: editData.textColor,
        position: editData.position,
        isActive: editData.isActive,
        priority: editData.priority,
        startDate: formatDate(editData.startDate),
        endDate: formatDate(editData.endDate),
      });
    }
  }, [editData, form, isEditMode]);

  // Watch fields for live preview
  const title = form.watch("title");
  const description = form.watch("description");
  const imageUrl = form.watch("imageUrl");
  const backgroundColor = form.watch("backgroundColor");
  const textColor = form.watch("textColor");

  // Update preview when form values change
  useEffect(() => {
    setAdPreview({
      title,
      description,
      imageUrl,
      backgroundColor,
      textColor,
    });
  }, [title, description, imageUrl, backgroundColor, textColor]);

  // Mutation for creating advertisement
  const createMutation = useMutation({
    mutationFn: async (values: AdFormValues) => {
      // Ensure priority is a number.
      // Server schema expects camelCase keys and Date objects for timestamp fields.
      const payload = {
        ...values, // Spread original form values (which are already camelCase)
        priority: Number(values.priority), // Ensure priority is a number
        startDate: new Date(values.startDate), // Send as Date object
        endDate: new Date(values.endDate),     // Send as Date object
      };
      
      const response = await fetch("/api/advertisements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Send the payload with camelCase keys
      });
      
      if (!response.ok) {
        // Attempt to parse the error response for more details
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If parsing fails, use the response status text
          throw new Error(response.statusText || "Failed to create advertisement");
        }
        // Use the server's message or Zod errors if available
        const message = errorData?.message || "Failed to create advertisement";
        const errors = errorData?.errors;
        const errorToThrow = new Error(message);
        if (errors) {
          (errorToThrow as any).cause = { errors }; // Attach Zod errors if present
        }
        throw errorToThrow;
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements/all"] });
      toast({
        title: "Advertisement created",
        description: "The advertisement has been created successfully.",
      });
      navigate("/admin/manage-advertisements");
    },
    onError: (error: any) => {
      console.error("Full error object:", error);
      let description = `Failed to create advertisement: ${error.message}`;
      // Check if the error is a Zod validation error passed from the server
      // The actual ZodError from the server might be nested if the server wraps it
      const serverError = error.cause || error; // Or however the server nests it
      if (serverError && serverError.errors && Array.isArray(serverError.errors)) {
        console.error("Zod validation errors:", serverError.errors);
        description = "Invalid advertisement data. Please check the following fields:";
        serverError.errors.forEach((err: any) => {
          description += `\n- ${err.path.join('.')} (${err.code}): ${err.message}`;
        });
      }
      toast({
        title: "Error",
        description: description,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating advertisement
  const updateMutation = useMutation({
    mutationFn: async (values: AdFormValues & { id: number }) => {
      const { id, ...adData } = values;
      
      const payload = {
        ...adData,
        priority: Number(adData.priority),
        startDate: new Date(adData.startDate),
        endDate: new Date(adData.endDate),
      };
      
      const response = await fetch(`/api/advertisements/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(response.statusText || "Failed to update advertisement");
        }
        const message = errorData?.message || "Failed to update advertisement";
        throw new Error(message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements/all"] });
      if (adId) {
        queryClient.invalidateQueries({ queryKey: [`/api/advertisements/${adId}`] });
      }
      toast({
        title: "Advertisement updated",
        description: "The advertisement has been updated successfully.",
      });
      navigate("/admin/manage-advertisements");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update advertisement: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: AdFormValues) => {
    if (isEditMode && adId) {
      updateMutation.mutate({ ...values, id: adId });
    } else {
      createMutation.mutate(values);
    }
  };

  const positions = [
    { value: "sidebar", label: "Sidebar" },
    { value: "footer", label: "Footer" },
    { value: "article-page", label: "Article Page" },
    { value: "home-page", label: "Home Page" },
  ];

  // Show loading state when fetching ad data in edit mode
  if (isEditMode && isLoadingAd) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">Loading advertisement data...</div>
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
              <Link href="/admin">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/manage-advertisements">Advertisements</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{isEditMode ? "Edit" : "Create"} Advertisement</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-['Roboto_Condensed']">{isEditMode ? "Edit" : "Create"} Advertisement</h1>
        <p className="text-muted-foreground">{isEditMode ? "Update existing" : "Create a new"} advertisement for your website</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Advertisement Details</CardTitle>
              <CardDescription>
                Fill in the details for your {isEditMode ? "existing" : "new"} advertisement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Advertisement title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description" 
                            {...field} 
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background Color</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <div 
                              className="w-10 h-10 border rounded" 
                              style={{ backgroundColor: field.value }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="textColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Text Color</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <div 
                              className="w-10 h-10 border rounded" 
                              style={{ backgroundColor: field.value }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Use a high-quality image that represents your advertisement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="linkUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/landing-page" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The URL where users will be directed when they click on your ad
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {positions.map((position) => (
                                <SelectItem 
                                  key={position.value} 
                                  value={position.value}
                                >
                                  {position.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose where you want the advertisement to appear
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority (1-10)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={10} 
                              {...field}
                              value={field.value}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Higher priority ads are shown first
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>
                            Enable or disable this advertisement
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => navigate("/admin/manage-advertisements")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending 
                        ? (isEditMode ? "Updating..." : "Creating...") 
                        : (isEditMode ? "Update" : "Create") + " Advertisement"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Advertisement Preview</CardTitle>
              <CardDescription>
                Preview how your advertisement will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="ad-preview border rounded-md overflow-hidden"
                style={{
                  backgroundColor: backgroundColor || "#e30613",
                  color: textColor || "#FFFFFF",
                }}
              >
                {imageUrl && (
                  <div className="relative h-40 w-full overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt="Ad preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/300x150?text=Preview+Image";
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{title || "Advertisement Title"}</h3>
                  <p>{description || "Advertisement description goes here"}</p>
                  <Button className="mt-4 w-full" variant="outline">Learn More</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tips for Effective Ads</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Use high-quality images with good contrast</p>
              <p>• Keep titles concise and compelling</p>
              <p>• Make sure text is readable against the background</p>
              <p>• Test your ads on different screen sizes</p>
              <p>• Set a relevant position for maximum visibility</p>
              <p>• Track performance and iterate on designs that work well</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
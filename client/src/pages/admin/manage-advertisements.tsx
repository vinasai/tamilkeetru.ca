import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Advertisement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  backgroundColor: string;
  textColor: string;
  position: string;
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
}

export default function ManageAdvertisements() {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Advertisement | null>(null);
  const { toast } = useToast();
  
  // Fetch advertisements
  const { data: advertisements = [], isLoading } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements/all"],
    queryFn: async () => {
      const response = await fetch("/api/advertisements/all");
      if (!response.ok) {
        throw new Error("Failed to fetch advertisements");
      }
      return response.json();
    },
  });

  // Delete advertisement mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/advertisements/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete advertisement");
      }
      
      // Handle 204 No Content responses (successful deletion with no response body)
      if (response.status === 204) {
        return true; // Return a successful indicator without trying to parse JSON
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements/all"] });
      toast({
        title: "Advertisement deleted",
        description: "The advertisement has been removed successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: `Failed to delete advertisement: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Toggle advertisement active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await fetch(`/api/advertisements/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update advertisement");
      }
      
      // Handle 204 No Content responses
      if (response.status === 204) {
        return { id, isActive }; // Return a successful indicator without trying to parse JSON
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements/all"] });
      toast({
        title: "Advertisement updated",
        description: "The advertisement status has been updated.",
      });
    },
    onError: (error) => {
      console.error("Toggle error:", error);
      toast({
        title: "Error",
        description: `Failed to update advertisement: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (ad: Advertisement) => {
    setAdToDelete(ad);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (adToDelete) {
      deleteMutation.mutate(adToDelete.id);
    }
  };

  const handleToggleActive = (ad: Advertisement) => {
    toggleActiveMutation.mutate({ id: ad.id, isActive: !ad.isActive });
  };

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
            <BreadcrumbPage>Manage Advertisements</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-['Roboto_Condensed']">Manage Advertisements</h1>
        <Link href="/admin/advertisements/create">
          <Button>
            <i className="fas fa-plus mr-2"></i> Create New Advertisement
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Advertisements</CardTitle>
          <CardDescription>
            Manage your website advertisements, track performance, and update settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading advertisements...</div>
          ) : advertisements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No advertisements found</p>
              <Link href="/admin/advertisements/create">
                <Button variant="outline">Create your first advertisement</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Title</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Impressions</TableHead>
                  <TableHead className="text-center">Clicks</TableHead>
                  <TableHead className="text-center">CTR</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advertisements.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {ad.imageUrl && (
                          <img 
                            src={ad.imageUrl} 
                            alt={ad.title} 
                            className="w-10 h-10 object-cover rounded mr-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/100?text=Ad";
                            }}
                          />
                        )}
                        <div>
                          <div>{ad.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {ad.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {ad.position.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ad.isActive ? "default" : "secondary"} className={ad.isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                        {ad.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{ad.impressions || 0}</TableCell>
                    <TableCell className="text-center">{ad.clicks || 0}</TableCell>
                    <TableCell className="text-center">
                      {ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(2) + "%" : "0%"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <i className="fas fa-ellipsis-h"></i>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/advertisements/edit/${ad.id}`}>
                              <i className="fas fa-edit mr-2"></i> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(ad)}>
                            <i className={`fas fa-${ad.isActive ? "eye-slash" : "eye"} mr-2`}></i>
                            {ad.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(ad)}
                          >
                            <i className="fas fa-trash mr-2"></i> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Advertisement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the advertisement "{adToDelete?.title}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
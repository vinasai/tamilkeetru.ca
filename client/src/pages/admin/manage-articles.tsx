import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArticleWithDetails } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ManageArticles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: articles, isLoading } = useQuery<ArticleWithDetails[]>({
    queryKey: ["/api/articles/all"],
  });

  const handleDeleteClick = (articleId: number) => {
    setArticleToDelete(articleId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (articleToDelete === null) return;

    try {
      await apiRequest("DELETE", `/api/articles/${articleToDelete}`);
      toast({
        title: "Article deleted",
        description: "The article has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/all"] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete article",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const handleToggleFeature = async (articleId: number, currentStatus: boolean) => {
    try {
      await apiRequest("PATCH", `/api/articles/${articleId}`, { isFeatured: !currentStatus });
      toast({
        title: `Article ${currentStatus ? "removed from" : "added to"} featured`,
        description: `The article has been ${currentStatus ? "removed from" : "added to"} featured articles.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/all"] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update article",
        variant: "destructive",
      });
    }
  };

  const handleToggleBreaking = async (articleId: number, currentStatus: boolean) => {
    try {
      await apiRequest("PATCH", `/api/articles/${articleId}`, { isBreaking: !currentStatus });
      toast({
        title: `Article ${currentStatus ? "removed from" : "added to"} breaking news`,
        description: `The article has been ${currentStatus ? "removed from" : "added to"} breaking news.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/all"] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update article",
        variant: "destructive",
      });
    }
  };

  // Filter articles based on search term
  const filteredArticles = articles?.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.author.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-['Roboto_Condensed']">Manage Articles</h1>
        <Link href="/admin/articles/create">
          <Button className="bg-secondary text-white">
            <i className="fas fa-plus-circle mr-2"></i> Add New Article
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Articles</CardTitle>
          <CardDescription>
            Manage all your news articles from here. You can edit, delete, or change article status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <Input
              placeholder="Search articles..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              {filteredArticles?.length || 0} articles found
            </div>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No articles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredArticles?.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div className="font-medium">{article.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{article.category.name}</TableCell>
                        <TableCell>{article.author.username}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {article.isFeatured && (
                              <Badge variant="default" className="bg-accent text-white">
                                Featured
                              </Badge>
                            )}
                            {article.isBreaking && (
                              <Badge variant="default" className="bg-secondary">
                                Breaking
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/article/${article.slug}`} target="_blank">
                              <Button variant="outline" size="sm">
                                <i className="fas fa-eye"></i>
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <i className="fas fa-cog"></i>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link href={`/admin/articles/edit/${article.id}`}>
                                  <DropdownMenuItem>
                                    <i className="fas fa-edit mr-2"></i> Edit
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem onClick={() => handleToggleFeature(article.id, article.isFeatured)}>
                                  <i className={`fas fa-${article.isFeatured ? 'times' : 'star'} mr-2`}></i>
                                  {article.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleBreaking(article.id, article.isBreaking)}>
                                  <i className={`fas fa-${article.isBreaking ? 'times' : 'bolt'} mr-2`}></i>
                                  {article.isBreaking ? 'Remove from Breaking' : 'Mark as Breaking'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteClick(article.id)}
                                >
                                  <i className="fas fa-trash-alt mr-2"></i> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./index";
import { setupAuth } from "./auth";
import { slugify } from "../shared/utils";
import { insertArticleSchema, insertCategorySchema, insertCommentSchema, insertNewsletterSchema, insertAdvertisementSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Database health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Use the explicit connection check method if available
      if (typeof storage.checkConnection === 'function') {
        const status = await storage.checkConnection();
        
        if (status.connected) {
          res.json({ 
            status: "ok", 
            database: "connected",
            message: "Database is connected and operational"
          });
        } else {
          res.status(503).json({ 
            status: "error", 
            database: "disconnected",
            message: status.error || "Database connection is not available"
          });
        }
      } else {
        // Fallback for older implementation
        const isConnected = (storage as any).isConnected;
        
        if (isConnected) {
          res.json({ 
            status: "ok", 
            database: "connected",
            message: "Database is connected and operational"
          });
        } else {
          res.status(503).json({ 
            status: "error", 
            database: "disconnected",
            message: "Database connection is not available"
          });
        }
      }
    } catch (error) {
      res.status(500).json({ 
        status: "error", 
        database: "unknown",
        message: "Failed to check database status"
      });
    }
  });

  // API Routes
  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      
      if (categories.length === 0) {
        return res.status(200).json({
          status: "empty",
          message: "No categories found",
          data: []
        });
      }
      
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(Number(req.params.id));
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(Number(req.params.id), categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const success = await storage.deleteCategory(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Category not found or has articles" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Article routes
  app.get("/api/articles", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      if (search) {
        const articles = await storage.searchArticles(search as string);
        
        if (articles.length === 0) {
          return res.status(200).json({
            status: "empty",
            message: `No articles found matching "${search}"`,
            data: []
          });
        }
        
        return res.json(articles);
      }
      
      if (category) {
        const articles = await storage.getCategoryArticles(category as string);
        
        if (articles.length === 0) {
          return res.status(200).json({
            status: "empty",
            message: `No articles found in category "${category}"`,
            data: []
          });
        }
        
        return res.json(articles);
      }
      
      const articles = await storage.getArticles();
      
      if (articles.length === 0) {
        return res.status(200).json({
          status: "empty",
          message: "No articles found",
          data: []
        });
      }
      
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/all", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const articles = await storage.getFeaturedArticles(limit);
      
      if (articles.length === 0) {
        return res.status(200).json({
          status: "empty",
          message: "No featured articles found",
          data: []
        });
      }
      
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured articles" });
    }
  });

  app.get("/api/articles/breaking", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const articles = await storage.getBreakingArticles(limit);
      
      if (articles.length === 0) {
        return res.status(200).json({
          status: "empty",
          message: "No breaking news found",
          data: []
        });
      }
      
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch breaking news" });
    }
  });

  app.get("/api/articles/popular", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const articles = await storage.getPopularArticles(limit);
      
      if (articles.length === 0) {
        return res.status(200).json({
          status: "empty",
          message: "No popular articles found",
          data: []
        });
      }
      
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular articles" });
    }
  });

  app.get("/api/articles/latest", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 3;
      const articles = await storage.getArticles();
      
      // Return the most recent articles based on createdAt timestamp
      const latestArticles = articles
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
      
      if (latestArticles.length === 0) {
        return res.status(200).json({
          status: "empty",
          message: "No latest articles found",
          data: []
        });
      }
      
      res.json(latestArticles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch latest articles" });
    }
  });

  app.get("/api/articles/category/:slug", async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const articles = await storage.getCategoryArticles(req.params.slug, limit);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category articles" });
    }
  });

  app.get("/api/articles/related/:id", async (req, res) => {
    try {
      const { categoryId, limit } = req.query;
      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }
      
      const articles = await storage.getRelatedArticles(
        Number(req.params.id), 
        Number(categoryId), 
        limit ? Number(limit) : undefined
      );
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch related articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticleWithDetails(Number(req.params.id));
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.get("/api/articles/slug/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const articleData = insertArticleSchema.parse(req.body);
      // Ensure slug is valid if not provided
      if (!articleData.slug) {
        articleData.slug = slugify(articleData.title);
      }
      
      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid article data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.patch("/api/articles/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const articleData = insertArticleSchema.partial().parse(req.body);
      const article = await storage.updateArticle(Number(req.params.id), articleData);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid article data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete("/api/articles/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const success = await storage.deleteArticle(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Comment routes
  app.get("/api/comments", async (req, res) => {
    try {
      const comments = await storage.getComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.get("/api/articles/:id/comments", async (req, res) => {
    try {
      const userId = req.isAuthenticated() ? req.user!.id : undefined;
      const comments = await storage.getArticleComments(Number(req.params.id), userId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post("/api/comments/:id/like", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const result = await storage.toggleCommentLike(Number(req.params.id), req.user!.id);
      if (!result) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to update comment like status" });
    }
  });

  // Like routes
  app.get("/api/articles/:id/likes", async (req, res) => {
    try {
      const likes = await storage.getArticleLikes(Number(req.params.id));
      res.json(likes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article likes" });
    }
  });

  app.get("/api/articles/:articleId/likes/:userId", async (req, res) => {
    try {
      const like = await storage.getUserLike(
        Number(req.params.articleId), 
        Number(req.params.userId)
      );
      
      if (!like) {
        return res.status(404).json({ message: "Like not found" });
      }
      
      res.json(like);
    } catch (error) {
      res.status(500).json({ message: "Failed to check if user liked article" });
    }
  });

  app.post("/api/articles/:id/like", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const like = await storage.createLike({
        articleId: Number(req.params.id),
        userId: req.body.userId || req.user!.id
      });
      
      res.status(201).json(like);
    } catch (error) {
      res.status(500).json({ message: "Failed to like article" });
    }
  });

  app.delete("/api/articles/:articleId/like/:userId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const success = await storage.deleteLike(
        Number(req.params.articleId), 
        Number(req.params.userId)
      );
      
      if (!success) {
        return res.status(404).json({ message: "Like not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike article" });
    }
  });

  // Newsletter routes
  app.get("/api/newsletters", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const subscribers = await storage.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch newsletter subscribers" });
    }
  });

  app.post("/api/newsletters", async (req, res) => {
    try {
      const newsletterData = insertNewsletterSchema.parse(req.body);
      const subscriber = await storage.createNewsletterSubscriber(newsletterData);
      res.status(201).json(subscriber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid newsletter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      // Only authenticated users can see the user list
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Existing endpoint to get a specific user
  app.get("/api/users/:id", async (req, res) => {
    try {
      // Only authenticated users can see user details
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password hash
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Endpoint to update user profile
  app.patch("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Only allow users to update their own profile unless they're an admin
      if (req.user?.id !== Number(req.params.id) && !req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Only allow updating username, email, and password
      const { username, email, password } = req.body;
      const updateData: any = {};
      
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (password) updateData.password = password; // Password will be hashed in storage
      
      const user = await storage.updateUser(Number(req.params.id), updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password hash
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Add this new endpoint after the existing user routes
  app.get("/api/users/top-commenters", async (req, res) => {
    try {
      // Get users with their comment counts (limit to top 5)
      const topCommenters = await storage.getUsersWithCommentCounts(5);
      res.json(topCommenters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top commenters" });
    }
  });

  // User dashboard endpoints
  app.get("/api/users/:userId/likes", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = Number(req.params.userId);
      
      // Get all likes for this user
      const likes = await storage.getUserLikes(userId);
      
      // For each like, get the article details
      const articles = [];
      for (const like of likes) {
        const article = await storage.getArticleWithDetails(like.articleId);
        if (article) {
          articles.push({
            id: article.id,
            slug: article.slug,
            title: article.title,
            category: article.category.name,
            date: new Date(article.createdAt).toISOString().split('T')[0]
          });
        }
      }
      
      res.json(articles);
    } catch (error) {
      console.error("Error fetching user likes:", error);
      res.status(500).json({ message: "Failed to fetch liked articles" });
    }
  });
  
  app.get("/api/users/:userId/comments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = Number(req.params.userId);
      
      // Get all comments by this user
      const comments = await storage.getUserComments(userId);
      
      // For each comment, get the article details
      const articles = [];
      for (const comment of comments) {
        const article = await storage.getArticleWithDetails(comment.articleId);
        if (article) {
          articles.push({
            id: article.id,
            slug: article.slug,
            title: article.title,
            category: article.category.name,
            date: new Date(article.createdAt).toISOString().split('T')[0],
            comment: comment.content
          });
        }
      }
      
      res.json(articles);
    } catch (error) {
      console.error("Error fetching user comments:", error);
      res.status(500).json({ message: "Failed to fetch commented articles" });
    }
  });
  
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = Number(req.params.userId);
      
      // Get like count
      const likes = await storage.getUserLikes(userId);
      const totalLikes = likes.length;
      
      // Get comment count
      const comments = await storage.getUserComments(userId);
      const totalComments = comments.length;
      
      // Calculate reach (this is an example - adjust as needed)
      // For now, we'll assume reach is the sum of view counts of all articles user has interacted with
      const interactedArticleIds = new Set([
        ...likes.map((like) => like.articleId),
        ...comments.map((comment) => comment.articleId)
      ]);
      
      // This is a placeholder - in a real app, you would track article views
      const articleReach = interactedArticleIds.size * 50; // Assuming each article has ~50 views
      
      // Get last active date (most recent like or comment)
      const allDates = [
        ...likes.map((like) => new Date(like.createdAt).getTime()),
        ...comments.map((comment) => new Date(comment.createdAt).getTime())
      ];
      
      const lastActive = allDates.length > 0 
        ? new Date(Math.max(...allDates)).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      res.json({
        totalLikes,
        totalComments,
        articleReach,
        lastActive
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Advertisements endpoint - get all advertisements
  app.get("/api/advertisements", async (req, res) => {
    try {
      const { position } = req.query;
      
      if (position) {
        const advertisements = await storage.getAdvertisementsByPosition(position as string);
        res.json(advertisements);
      } else {
        const advertisements = await storage.getAdvertisements();
        res.json(advertisements);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch advertisements" });
    }
  });
  
  app.get("/api/advertisements/all", async (req, res) => {
    try {
      const advertisements = await storage.getAdvertisements();
      res.json(advertisements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch advertisements" });
    }
  });
  
  app.get("/api/advertisements/:id", async (req, res) => {
    try {
      const advertisement = await storage.getAdvertisement(Number(req.params.id));
      if (!advertisement) {
        return res.status(404).json({ message: "Advertisement not found" });
      }
      res.json(advertisement);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch advertisement" });
    }
  });
  
  app.post("/api/advertisements", async (req, res) => {
    try {
      const advertisementData = insertAdvertisementSchema.parse(req.body);
      const advertisement = await storage.createAdvertisement(advertisementData);
      res.status(201).json(advertisement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("ZodError on server:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid advertisement data", errors: error.errors });
      }
      console.error("Non-Zod error on /api/advertisements POST:", error);
      res.status(500).json({ message: "Failed to create advertisement" });
    }
  });
  
  app.patch("/api/advertisements/:id", async (req, res) => {
    try {
      const advertisementData = insertAdvertisementSchema.partial().parse(req.body);
      const advertisement = await storage.updateAdvertisement(Number(req.params.id), advertisementData);
      if (!advertisement) {
        return res.status(404).json({ message: "Advertisement not found" });
      }
      res.json(advertisement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid advertisement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update advertisement" });
    }
  });
  
  app.delete("/api/advertisements/:id", async (req, res) => {
    try {
      const success = await storage.deleteAdvertisement(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Advertisement not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete advertisement" });
    }
  });
  
  // Advertisement metrics endpoints
  app.post("/api/advertisements/impression/:id", async (req, res) => {
    try {
      const success = await storage.trackAdvertisementImpression(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Advertisement not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to track impression" });
    }
  });
  
  app.post("/api/advertisements/click/:id", async (req, res) => {
    try {
      const success = await storage.trackAdvertisementClick(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Advertisement not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to track click" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

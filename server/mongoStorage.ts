import { 
  users, type User, type InsertUser, 
  categories, type Category, type InsertCategory,
  articles, type Article, type InsertArticle, type ArticleWithDetails,
  comments, type Comment, type InsertComment, type CommentWithUser,
  likes, type Like, type InsertLike,
  newsletters, type Newsletter, type InsertNewsletter
} from "@shared/schema";
import { type IStorage } from "./storage";
import session from "express-session";
import MongoStore from "connect-mongo";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import {
  UserModel,
  CategoryModel,
  ArticleModel,
  CommentModel,
  LikeModel,
  NewsletterModel,
  connectDB,
  isMongoConnected,
  safeMongoExecute
} from "./models/mongoose";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

// In-memory fallback storage
const inMemoryData = {
  users: [] as User[],
  categories: [] as Category[],
  articles: [] as Article[],
  comments: [] as Comment[],
  likes: [] as Like[],
  newsletters: [] as Newsletter[]
};

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export class MongoStorage implements IStorage {
  sessionStore: session.Store = new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  });
  isConnected: boolean = false;
  connectionError: string | null = null;

  constructor() {
    // Try to connect to MongoDB
    this.initialize();
    // Set up reconnection attempts
    setInterval(() => {
      if (!this.isConnected) {
        this.reconnect();
      }
    }, 30000); // Try every 30 seconds
  }

  private async initialize() {
    try {
      // Connect to MongoDB
      this.isConnected = await connectDB();
      
      if (this.isConnected) {
        this.connectionError = null;
        // Create appropriate session store based on connection status
        this.sessionStore = MongoStore.create({
          mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/dailypulse',
          ttl: 14 * 24 * 60 * 60, // 14 days
          autoRemove: 'native'
        });
        
        // Initialize with seed data if DB is empty
        await this.seedDataIfEmpty();
      } else {
        this.connectionError = "Could not connect to MongoDB";
        // Fallback to memory store if MongoDB connection failed
        console.log('Using in-memory session store as fallback.');
        this.sessionStore = new MemoryStore({
          checkPeriod: 86400000, // prune expired entries every 24h
        });
      }
    } catch (error) {
      this.connectionError = error instanceof Error ? error.message : "Unknown error during database connection";
      console.error('Error initializing storage:', error);
      // Fallback to memory store
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      });
      this.isConnected = false;
    }
  }

  // Method to check database connectivity
  async checkConnection(): Promise<{connected: boolean, error: string | null}> {
    // Update connection status
    this.isConnected = isMongoConnected();
    
    return {
      connected: this.isConnected,
      error: this.connectionError
    };
  }

  private async seedDataIfEmpty() {
    if (!this.isConnected) return;
    
    try {
      const usersCount = await UserModel.countDocuments();
      if (usersCount === 0) {
        await this.seedData();
      }
    } catch (error) {
      console.error('Error checking database for seed data:', error);
    }
  }

  private async seedData() {
    try {
      console.log('Seeding initial data...');
      
      // Create admin user
      const adminPassword = await hashPassword('admin123');
      const adminUser = new UserModel({
        id: 1,
        username: 'admin',
        email: 'admin@dailypulse.com',
        password: adminPassword,
        isAdmin: true,
        createdAt: new Date()
      });
      
      await adminUser.save();
      console.log('Created admin user successfully');
      
      // Add more seed data here if needed
      
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return safeMongoExecute(async () => {
      const user = await UserModel.findOne({ id });
      return user ? user.toObject() : undefined;
    }, inMemoryData.users.find(u => u.id === id));
  }

  async getUsers(): Promise<User[]> {
    return safeMongoExecute(async () => {
      const users = await UserModel.find();
      return users.map(user => user.toObject());
    }, inMemoryData.users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return safeMongoExecute(async () => {
      const user = await UserModel.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') } 
      });
      return user ? user.toObject() : undefined;
    }, inMemoryData.users.find(u => u.username.toLowerCase() === username.toLowerCase()));
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return safeMongoExecute(async () => {
      const user = await UserModel.findOne({ 
        email: { $regex: new RegExp(`^${email}$`, 'i') } 
      });
      return user ? user.toObject() : undefined;
    }, inMemoryData.users.find(u => u.email.toLowerCase() === email.toLowerCase()));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return safeMongoExecute(async () => {
      // Get the next ID
      const maxUser = await UserModel.findOne().sort({ id: -1 });
      const nextId = maxUser ? maxUser.id + 1 : 1;
      
      const now = new Date();
      const newUser = new UserModel({ 
        ...insertUser, 
        id: nextId,
        isAdmin: insertUser.isAdmin || false,
        createdAt: now
      });
      
      await newUser.save();
      return newUser.toObject();
    }, this.createInMemoryUser(insertUser));
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    return safeMongoExecute(async () => {
      // Handle password updates
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }

      const updatedUser = await UserModel.findOneAndUpdate(
        { id },
        { $set: userData },
        { new: true }
      );
      
      return updatedUser ? updatedUser.toObject() : undefined;
    }, undefined);
  }

  // Helper for in-memory user creation
  private createInMemoryUser(insertUser: InsertUser): User {
    const nextId = inMemoryData.users.length > 0 
      ? Math.max(...inMemoryData.users.map(u => u.id)) + 1 
      : 1;
    
    const now = new Date();
    const newUser: User = {
      ...insertUser,
      id: nextId,
      isAdmin: insertUser.isAdmin || false,
      createdAt: now
    };
    
    inMemoryData.users.push(newUser);
    return newUser;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return safeMongoExecute(async () => {
      const categories = await CategoryModel.find();
      return categories.map(category => category.toObject());
    }, inMemoryData.categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return safeMongoExecute(async () => {
      const category = await CategoryModel.findOne({ id });
      return category ? category.toObject() : undefined;
    }, inMemoryData.categories.find(c => c.id === id));
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return safeMongoExecute(async () => {
      const category = await CategoryModel.findOne({ slug });
      return category ? category.toObject() : undefined;
    }, inMemoryData.categories.find(c => c.slug === slug));
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    return safeMongoExecute(async () => {
      // Get the next ID
      const maxCategory = await CategoryModel.findOne().sort({ id: -1 });
      const nextId = maxCategory ? maxCategory.id + 1 : 1;
      
      const newCategory = new CategoryModel({ 
        ...insertCategory, 
        id: nextId,
        postCount: insertCategory.postCount || 0
      });
      
      await newCategory.save();
      return newCategory.toObject();
    }, this.createInMemoryCategory(insertCategory));
  }

  // Helper for in-memory category creation
  private createInMemoryCategory(insertCategory: InsertCategory): Category {
    const nextId = inMemoryData.categories.length > 0 
      ? Math.max(...inMemoryData.categories.map(c => c.id)) + 1 
      : 1;
    
    const newCategory: Category = {
      ...insertCategory,
      id: nextId,
      postCount: insertCategory.postCount || 0,
      description: insertCategory.description || null
    };
    
    inMemoryData.categories.push(newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined> {
    return safeMongoExecute(async () => {
      const updatedCategory = await CategoryModel.findOneAndUpdate(
        { id },
        { $set: category },
        { new: true }
      );
      
      return updatedCategory ? updatedCategory.toObject() : undefined;
    }, undefined);
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return safeMongoExecute(async () => {
      // Check if category has articles
      const articleCount = await ArticleModel.countDocuments({ categoryId: id });
      
      if (articleCount > 0) {
        return false;
      }
      
      const result = await CategoryModel.deleteOne({ id });
      return result.deletedCount === 1;
    }, false);
  }
  
  async incrementCategoryPostCount(id: number): Promise<Category | undefined> {
    return safeMongoExecute(async () => {
      const category = await CategoryModel.findOneAndUpdate(
        { id },
        { $inc: { postCount: 1 } },
        { new: true }
      );
      
      return category ? category.toObject() : undefined;
    }, undefined);
  }
  
  async decrementCategoryPostCount(id: number): Promise<Category | undefined> {
    return safeMongoExecute(async () => {
      const category = await CategoryModel.findOneAndUpdate(
        { id },
        { $inc: { postCount: -1 } },
        { new: true }
      );
      
      if (category && category.postCount < 0) {
        category.postCount = 0;
        await category.save();
      }
      
      return category ? category.toObject() : undefined;
    }, undefined);
  }
  
  // Article methods
  async getArticles(): Promise<ArticleWithDetails[]> {
    return safeMongoExecute(async () => {
      const articles = await ArticleModel.find().sort({ createdAt: -1 });
      return Promise.all(articles.map(article => this.enrichArticleWithDetails(article.toObject())));
    }, []);
  }
  
  async getArticle(id: number): Promise<Article | undefined> {
    return safeMongoExecute(async () => {
      const article = await ArticleModel.findOne({ id });
      return article ? article.toObject() : undefined;
    }, inMemoryData.articles.find(a => a.id === id));
  }
  
  async getArticleWithDetails(id: number): Promise<ArticleWithDetails | undefined> {
    return safeMongoExecute(async () => {
      const article = await ArticleModel.findOne({ id });
      if (!article) return undefined;
      
      return this.enrichArticleWithDetails(article.toObject());
    }, undefined);
  }
  
  async getArticleBySlug(slug: string): Promise<ArticleWithDetails | undefined> {
    return safeMongoExecute(async () => {
      const article = await ArticleModel.findOne({ slug });
      if (!article) return undefined;
      
      return this.enrichArticleWithDetails(article.toObject());
    }, undefined);
  }
  
  async getFeaturedArticles(limit = 5): Promise<ArticleWithDetails[]> {
    return safeMongoExecute(async () => {
      const articles = await ArticleModel.find({ isFeatured: true })
        .sort({ createdAt: -1 })
        .limit(limit);
      
      return Promise.all(articles.map(article => this.enrichArticleWithDetails(article.toObject())));
    }, []);
  }
  
  async getBreakingArticles(limit = 5): Promise<ArticleWithDetails[]> {
    return safeMongoExecute(async () => {
      const articles = await ArticleModel.find({ isBreaking: true })
        .sort({ createdAt: -1 })
        .limit(limit);
      
      return Promise.all(articles.map(article => this.enrichArticleWithDetails(article.toObject())));
    }, []);
  }
  
  async getPopularArticles(limit = 5): Promise<ArticleWithDetails[]> {
    return safeMongoExecute(async () => {
      const articles = await ArticleModel.find()
        .sort({ likeCount: -1, commentCount: -1 })
        .limit(limit);
      
      return Promise.all(articles.map(article => this.enrichArticleWithDetails(article.toObject())));
    }, []);
  }
  
  async getArticlesByCategory(categoryId: number, limit = 10): Promise<ArticleWithDetails[]> {
    return safeMongoExecute(async () => {
      const articles = await ArticleModel.find({ categoryId })
        .sort({ createdAt: -1 })
        .limit(limit);
      
      return Promise.all(articles.map(article => this.enrichArticleWithDetails(article.toObject())));
    }, []);
  }
  
  async getCategoryArticles(categorySlug: string, limit = 10): Promise<ArticleWithDetails[]> {
    return safeMongoExecute(async () => {
      const category = await CategoryModel.findOne({ slug: categorySlug });
      if (!category) return [];
      
      return this.getArticlesByCategory(category.id, limit);
    }, []);
  }
  
  async getRelatedArticles(articleId: number, categoryId: number, limit = 3): Promise<ArticleWithDetails[]> {
    return safeMongoExecute(async () => {
      const articles = await ArticleModel.find({ 
        id: { $ne: articleId }, 
        categoryId 
      })
        .sort({ createdAt: -1 })
        .limit(limit);
      
      return Promise.all(articles.map(article => this.enrichArticleWithDetails(article.toObject())));
    }, []);
  }
  
  async searchArticles(query: string): Promise<ArticleWithDetails[]> {
    return safeMongoExecute(async () => {
      const searchRegex = new RegExp(query, 'i');
      
      const articles = await ArticleModel.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { excerpt: searchRegex }
        ]
      }).sort({ createdAt: -1 });
      
      return Promise.all(articles.map(article => this.enrichArticleWithDetails(article.toObject())));
    }, []);
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    return safeMongoExecute(async () => {
      // Get the next ID
      const maxArticle = await ArticleModel.findOne().sort({ id: -1 });
      const nextId = maxArticle ? maxArticle.id + 1 : 1;
      
      const now = new Date();
      const newArticle = new ArticleModel({ 
        ...insertArticle, 
        id: nextId,
        likeCount: 0,
        commentCount: 0,
        createdAt: now,
        updatedAt: now,
        isFeatured: insertArticle.isFeatured || false,
        isBreaking: insertArticle.isBreaking || false
      });
      
      await newArticle.save();
      
      // Increment category post count
      await this.incrementCategoryPostCount(newArticle.categoryId);
      
      return newArticle.toObject();
    }, this.createInMemoryArticle(insertArticle));
  }

  async updateArticle(id: number, articleData: Partial<Article>): Promise<Article | undefined> {
    return safeMongoExecute(async () => {
      // Get the current article to check category change
      const currentArticle = await ArticleModel.findOne({ id });
      if (!currentArticle) return undefined;

      const originalCategoryId = currentArticle.categoryId;

      const updatedArticle = await ArticleModel.findOneAndUpdate(
        { id },
        { $set: { ...articleData, updatedAt: new Date() } }, // Update updatedAt timestamp
        { new: true } // Return the updated document
      );

      if (!updatedArticle) return undefined;

      // Check if category changed and update counts
      const newCategoryId = updatedArticle.categoryId;
      if (originalCategoryId !== newCategoryId) {
        await this.decrementCategoryPostCount(originalCategoryId);
        await this.incrementCategoryPostCount(newCategoryId);
      }

      return updatedArticle.toObject();
    }, undefined);
  }

  async deleteArticle(id: number): Promise<boolean> {
    return safeMongoExecute(async () => {
      // Get the article to decrement category count
      const article = await ArticleModel.findOne({ id });
      if (!article) return false;

      const categoryId = article.categoryId;
      
      // Delete the article
      const result = await ArticleModel.deleteOne({ id });
      
      if (result.deletedCount === 1) {
        // Decrement the category post count
        await this.decrementCategoryPostCount(categoryId);
        
        // Delete associated comments
        await CommentModel.deleteMany({ articleId: id });
        
        // Delete associated likes
        await LikeModel.deleteMany({ articleId: id });
        
        return true;
      }
      
      return false;
    }, false);
  }

  // Helper for in-memory article creation
  private createInMemoryArticle(insertArticle: InsertArticle): Article {
    const nextId = inMemoryData.articles.length > 0 
      ? Math.max(...inMemoryData.articles.map(a => a.id)) + 1 
      : 1;
    
    const now = new Date();
    const newArticle: Article = {
      ...insertArticle,
      id: nextId,
      likeCount: 0,
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
      isFeatured: insertArticle.isFeatured || false,
      isBreaking: insertArticle.isBreaking || false
    };
    
    inMemoryData.articles.push(newArticle);
    return newArticle;
  }

  private async reconnect() {
    try {
      this.isConnected = await connectDB();
      if (this.isConnected) {
        this.connectionError = null;
        console.log('Reconnected to MongoDB successfully');
      }
    } catch (error) {
      console.error('Failed to reconnect to MongoDB:', error);
    }
  }

  // Helper methods
  private async enrichArticleWithDetails(article: Article): Promise<ArticleWithDetails> {
    return safeMongoExecute(async () => {
      const [category, author] = await Promise.all([
        CategoryModel.findOne({ id: article.categoryId }),
        UserModel.findOne({ id: article.authorId })
      ]);
      
      if (!category || !author) {
        throw new Error(`Could not find category or author for article ${article.id}`);
      }
      
      return {
        ...article,
        category: category.toObject(),
        author: author.toObject()
      };
    }, {
      ...article,
      category: inMemoryData.categories.find(c => c.id === article.categoryId) || { 
        id: 0, 
        name: 'Unknown', 
        slug: 'unknown',
        description: null,
        postCount: 0 
      },
      author: inMemoryData.users.find(u => u.id === article.authorId) || { 
        id: 0, 
        username: 'unknown',
        email: 'unknown@example.com',
        password: '',
        isAdmin: false,
        createdAt: new Date()
      }
    });
  }

  // Add this method in the User methods section
  async getUsersWithCommentCounts(limit: number = 5): Promise<(User & { commentCount: number; isPremium?: boolean })[]> {
    return safeMongoExecute(async () => {
      // Get all comments
      const comments = await CommentModel.find();
      
      // Count comments by user ID
      const userCommentCounts = new Map<number, number>();
      
      comments.forEach(comment => {
        const userId = comment.userId;
        userCommentCounts.set(userId, (userCommentCounts.get(userId) || 0) + 1);
      });
      
      // Get users
      const users = await UserModel.find();
      
      // Combine user data with comment counts
      const usersWithCounts = users.map(user => {
        const userData = user.toObject();
        return {
          ...userData,
          commentCount: userCommentCounts.get(userData.id) || 0,
          // Premium status - in a real app this would come from user subscription data
          isPremium: Math.random() > 0.5 // Random for demo purposes
        };
      });
      
      // Sort by comment count and limit
      return usersWithCounts
        .sort((a, b) => b.commentCount - a.commentCount)
        .slice(0, limit);
    }, 
    // Fallback for in-memory data
    inMemoryData.users
      .map(user => ({
        ...user,
        commentCount: inMemoryData.comments.filter(c => c.userId === user.id).length,
        isPremium: Math.random() > 0.5 // Random for demo purposes
      }))
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, limit)
    );
  }
} 
import { 
  users, type User, type InsertUser, 
  categories, type Category, type InsertCategory,
  articles, type Article, type InsertArticle, type ArticleWithDetails,
  comments, type Comment, type InsertComment, type CommentWithUser,
  likes, type Like, type InsertLike,
  newsletters, type Newsletter, type InsertNewsletter
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  incrementCategoryPostCount(id: number): Promise<Category | undefined>;
  decrementCategoryPostCount(id: number): Promise<Category | undefined>;
  
  // Article methods
  getArticles(): Promise<ArticleWithDetails[]>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticleWithDetails(id: number): Promise<ArticleWithDetails | undefined>;
  getArticleBySlug(slug: string): Promise<ArticleWithDetails | undefined>;
  getFeaturedArticles(limit?: number): Promise<ArticleWithDetails[]>;
  getBreakingArticles(limit?: number): Promise<ArticleWithDetails[]>;
  getPopularArticles(limit?: number): Promise<ArticleWithDetails[]>;
  getArticlesByCategory(categoryId: number, limit?: number): Promise<ArticleWithDetails[]>;
  getCategoryArticles(categorySlug: string, limit?: number): Promise<ArticleWithDetails[]>;
  getRelatedArticles(articleId: number, categoryId: number, limit?: number): Promise<ArticleWithDetails[]>;
  searchArticles(query: string): Promise<ArticleWithDetails[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<Article>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  
  // Comment methods
  getComments(): Promise<Comment[]>;
  getArticleComments(articleId: number): Promise<CommentWithUser[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  likeComment(commentId: number, userId: number): Promise<Comment | undefined>;
  
  // Like methods
  getArticleLikes(articleId: number): Promise<Like[]>;
  getUserLike(articleId: number, userId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(articleId: number, userId: number): Promise<boolean>;
  
  // Newsletter methods
  getNewsletterSubscribers(): Promise<Newsletter[]>;
  getNewsletterSubscriber(email: string): Promise<Newsletter | undefined>;
  createNewsletterSubscriber(newsletter: InsertNewsletter): Promise<Newsletter>;
  deleteNewsletterSubscriber(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private articles: Map<number, Article>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  private newsletters: Map<number, Newsletter>;
  
  userCurrentId: number;
  categoryCurrentId: number;
  articleCurrentId: number;
  commentCurrentId: number;
  likeCurrentId: number;
  newsletterCurrentId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.articles = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.newsletters = new Map();
    
    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.articleCurrentId = 1;
    this.commentCurrentId = 1;
    this.likeCurrentId = 1;
    this.newsletterCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add initial data for demo purposes
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      isAdmin: insertUser.isAdmin || false,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      postCount: insertCategory.postCount || 0
    };
    this.categories.set(id, category);
    return category;
  }
  
  async updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    // Check if category has articles
    const categoryArticles = Array.from(this.articles.values()).filter(
      (article) => article.categoryId === id,
    );
    
    if (categoryArticles.length > 0) {
      return false;
    }
    
    return this.categories.delete(id);
  }
  
  async incrementCategoryPostCount(id: number): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, postCount: category.postCount + 1 };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async decrementCategoryPostCount(id: number): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, postCount: Math.max(0, category.postCount - 1) };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  // Article methods
  async getArticles(): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getArticleWithDetails(id: number): Promise<ArticleWithDetails | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    return this.enrichArticleWithDetails(article);
  }
  
  async getArticleBySlug(slug: string): Promise<ArticleWithDetails | undefined> {
    const article = Array.from(this.articles.values()).find(
      (article) => article.slug === slug,
    );
    
    if (!article) return undefined;
    
    return this.enrichArticleWithDetails(article);
  }
  
  async getFeaturedArticles(limit = 5): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .filter(article => article.isFeatured)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async getBreakingArticles(limit = 5): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .filter(article => article.isBreaking)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async getPopularArticles(limit = 5): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => {
        // Sort first by like count, then by comment count
        if (a.likeCount !== b.likeCount) {
          return b.likeCount - a.likeCount;
        }
        return b.commentCount - a.commentCount;
      })
      .slice(0, limit)
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async getArticlesByCategory(categoryId: number, limit = 10): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .filter(article => article.categoryId === categoryId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async getCategoryArticles(categorySlug: string, limit = 10): Promise<ArticleWithDetails[]> {
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category) return [];
    
    return this.getArticlesByCategory(category.id, limit);
  }
  
  async getRelatedArticles(articleId: number, categoryId: number, limit = 3): Promise<ArticleWithDetails[]> {
    return Array.from(this.articles.values())
      .filter(article => article.id !== articleId && article.categoryId === categoryId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async searchArticles(query: string): Promise<ArticleWithDetails[]> {
    const searchLower = query.toLowerCase();
    
    return Array.from(this.articles.values())
      .filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(article => this.enrichArticleWithDetails(article));
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleCurrentId++;
    const now = new Date();
    const article: Article = { 
      ...insertArticle, 
      id,
      likeCount: 0,
      commentCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.articles.set(id, article);
    
    // Increment category post count
    await this.incrementCategoryPostCount(article.categoryId);
    
    return article;
  }
  
  async updateArticle(id: number, article: Partial<Article>): Promise<Article | undefined> {
    const existingArticle = this.articles.get(id);
    if (!existingArticle) return undefined;
    
    // If category is changing, update post counts
    if (article.categoryId && article.categoryId !== existingArticle.categoryId) {
      await this.decrementCategoryPostCount(existingArticle.categoryId);
      await this.incrementCategoryPostCount(article.categoryId);
    }
    
    const updatedArticle = { 
      ...existingArticle, 
      ...article,
      updatedAt: new Date()
    };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }
  
  async deleteArticle(id: number): Promise<boolean> {
    const article = this.articles.get(id);
    if (!article) return false;
    
    // Remove article's comments
    Array.from(this.comments.values())
      .filter(comment => comment.articleId === id)
      .forEach(comment => this.comments.delete(comment.id));
    
    // Remove article's likes
    Array.from(this.likes.values())
      .filter(like => like.articleId === id)
      .forEach(like => this.likes.delete(like.id));
    
    // Decrement category post count
    await this.decrementCategoryPostCount(article.categoryId);
    
    return this.articles.delete(id);
  }
  
  // Comment methods
  async getComments(): Promise<Comment[]> {
    return Array.from(this.comments.values());
  }
  
  async getArticleComments(articleId: number): Promise<CommentWithUser[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.articleId === articleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(comment => this.enrichCommentWithUser(comment));
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentCurrentId++;
    const now = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id,
      likeCount: 0,
      createdAt: now
    };
    this.comments.set(id, comment);
    
    // Increment article comment count
    const article = this.articles.get(comment.articleId);
    if (article) {
      article.commentCount += 1;
      this.articles.set(article.id, article);
    }
    
    return comment;
  }
  
  async updateComment(id: number, comment: Partial<Comment>): Promise<Comment | undefined> {
    const existingComment = this.comments.get(id);
    if (!existingComment) return undefined;
    
    const updatedComment = { ...existingComment, ...comment };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment) return false;
    
    // Decrement article comment count
    const article = this.articles.get(comment.articleId);
    if (article) {
      article.commentCount = Math.max(0, article.commentCount - 1);
      this.articles.set(article.id, article);
    }
    
    // Remove child comments (replies) if any
    Array.from(this.comments.values())
      .filter(c => c.parentId === id)
      .forEach(c => this.deleteComment(c.id));
    
    return this.comments.delete(id);
  }
  
  async likeComment(commentId: number, userId: number): Promise<Comment | undefined> {
    const comment = this.comments.get(commentId);
    if (!comment) return undefined;
    
    // Check if user already liked this comment - simple implementation, no tracking
    comment.likeCount += 1;
    this.comments.set(commentId, comment);
    
    return comment;
  }
  
  // Like methods
  async getArticleLikes(articleId: number): Promise<Like[]> {
    return Array.from(this.likes.values())
      .filter(like => like.articleId === articleId);
  }
  
  async getUserLike(articleId: number, userId: number): Promise<Like | undefined> {
    return Array.from(this.likes.values()).find(
      like => like.articleId === articleId && like.userId === userId
    );
  }
  
  async createLike(insertLike: InsertLike): Promise<Like> {
    // Check if user already liked this article
    const existingLike = await this.getUserLike(insertLike.articleId, insertLike.userId);
    if (existingLike) {
      return existingLike;
    }
    
    const id = this.likeCurrentId++;
    const now = new Date();
    const like: Like = { 
      ...insertLike, 
      id,
      createdAt: now
    };
    this.likes.set(id, like);
    
    // Increment article like count
    const article = this.articles.get(like.articleId);
    if (article) {
      article.likeCount += 1;
      this.articles.set(article.id, article);
    }
    
    return like;
  }
  
  async deleteLike(articleId: number, userId: number): Promise<boolean> {
    const like = await this.getUserLike(articleId, userId);
    if (!like) return false;
    
    // Decrement article like count
    const article = this.articles.get(articleId);
    if (article) {
      article.likeCount = Math.max(0, article.likeCount - 1);
      this.articles.set(article.id, article);
    }
    
    return this.likes.delete(like.id);
  }
  
  // Newsletter methods
  async getNewsletterSubscribers(): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values());
  }
  
  async getNewsletterSubscriber(email: string): Promise<Newsletter | undefined> {
    return Array.from(this.newsletters.values()).find(
      newsletter => newsletter.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createNewsletterSubscriber(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    // Check if email already exists
    const existingSubscriber = await this.getNewsletterSubscriber(insertNewsletter.email);
    if (existingSubscriber) {
      return existingSubscriber;
    }
    
    const id = this.newsletterCurrentId++;
    const now = new Date();
    const newsletter: Newsletter = { 
      ...insertNewsletter, 
      id,
      createdAt: now
    };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }
  
  async deleteNewsletterSubscriber(id: number): Promise<boolean> {
    return this.newsletters.delete(id);
  }
  
  // Helper methods
  private enrichArticleWithDetails(article: Article): ArticleWithDetails {
    const category = this.categories.get(article.categoryId) as Category;
    const author = this.users.get(article.authorId) as User;
    
    return {
      ...article,
      category,
      author
    };
  }
  
  private enrichCommentWithUser(comment: Comment): CommentWithUser {
    const user = this.users.get(comment.userId) as User;
    
    // If this is a top-level comment, include replies
    const replies = comment.parentId ? [] : Array.from(this.comments.values())
      .filter(c => c.parentId === comment.id)
      .map(c => this.enrichCommentWithUser(c));
    
    return {
      ...comment,
      user,
      replies
    };
  }
  
  // Seed data for demo purposes
  private async seedData() {
    // Create an admin user
    await this.createUser({
      username: "admin",
      password: "password123", // In a real app, this would be hashed
      email: "admin@example.com",
      isAdmin: true
    });
    
    // Create categories
    const categories = [
      { name: "Politics", slug: "politics", description: "Political news and updates" },
      { name: "Business", slug: "business", description: "Business and economic news" },
      { name: "Technology", slug: "technology", description: "Technology news and innovations" },
      { name: "Sports", slug: "sports", description: "Sports news and results" },
      { name: "Entertainment", slug: "entertainment", description: "Entertainment and celebrity news" },
      { name: "Health", slug: "health", description: "Health and wellness news" },
      { name: "Science", slug: "science", description: "Scientific discoveries and research" },
      { name: "World", slug: "world", description: "International news" },
      { name: "Opinion", slug: "opinion", description: "Opinion pieces and editorials" }
    ];
    
    for (const category of categories) {
      await this.createCategory(category);
    }
  }
}

export const storage = new MemStorage();

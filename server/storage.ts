import { users, type User, type InsertUser, contents, type Content, type InsertContent } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content related methods
  getAllContents(): Promise<Content[]>;
  getContent(id: number): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<InsertContent>): Promise<Content | undefined>;
  deleteContent(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contents: Map<number, Content>;
  currentUserId: number;
  currentContentId: number;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.currentUserId = 1;
    this.currentContentId = 1;
    
    // Add some initial sample data
    this.createUser({ username: "demo", password: "password" });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Content related methods
  async getAllContents(): Promise<Content[]> {
    return Array.from(this.contents.values());
  }
  
  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }
  
  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.currentContentId++;
    const content: Content = { 
      ...insertContent, 
      id,
      createdAt: new Date() 
    };
    this.contents.set(id, content);
    return content;
  }
  
  async updateContent(id: number, updateContent: Partial<InsertContent>): Promise<Content | undefined> {
    const content = this.contents.get(id);
    if (!content) return undefined;
    
    const updatedContent: Content = { 
      ...content, 
      ...updateContent 
    };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  async deleteContent(id: number): Promise<boolean> {
    if (!this.contents.has(id)) return false;
    return this.contents.delete(id);
  }
}

export const storage = new MemStorage();

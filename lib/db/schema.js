import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  boolean, 
  uuid, 
  jsonb, 
  primaryKey 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// 1. ROLES Y USUARIOS (RBAC)
// ==========================================

export const roles = pgTable("roles", {
  id: varchar("id", { length: 50 }).primaryKey(), // 'USER', 'ADMIN', 'SUPER_ADMIN'
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  auth0Id: varchar("auth0_id", { length: 255 }).notNull().unique(), // Sincronizado desde Auth0 (sub)
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  picture: text("picture"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: varchar("role_id", { length: 50 }).notNull().references(() => roles.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  assignedBy: uuid("assigned_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] }),
}));

// ==========================================
// 2. ESTRUCTURA DE LA DOCUMENTACIÓN (SDD)
// ==========================================

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 150 }).notNull().unique(), // ej: 'introduccion', 'requerimientos', 'diseno'
  title: varchar("title", { length: 255 }).notNull(), // ej: '📋 Fase 1: Requerimientos'
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // 'BookOpen', 'FileText', 'Cpu', 'CheckCircle', etc.
  badgeText: varchar("badge_text", { length: 50 }), // 'Product Manager', 'Arquitecto', 'Front & Back', 'QA', etc.
  badgeVariant: varchar("badge_variant", { length: 50 }).default("note"), // 'note', 'caution', 'success', 'tip', 'danger'
  orderIndex: integer("order_index").default(0).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  slug: varchar("slug", { length: 255 }).notNull().unique(), // ej: 'requerimientos/sintaxis-ears'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  rawMarkdown: text("raw_markdown").notNull(), // Contenido Markdown
  frontmatter: jsonb("frontmatter").default({}), // Metadatos parseados
  orderIndex: integer("order_index").default(0).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
  updatedById: uuid("updated_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// 3. ARCHIVOS MD Y CONTROL DE VERSIONES
// ==========================================

export const markdownFiles = pgTable("markdown_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(), // ej: 'sintaxis-ears.md'
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).default("text/markdown").notNull(),
  contentHash: varchar("content_hash", { length: 64 }).notNull(), // SHA-256
  uploadedById: uuid("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentRevisions = pgTable("document_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  rawMarkdown: text("raw_markdown").notNull(),
  changeSummary: varchar("change_summary", { length: 255 }), // ej: 'Actualizado vía upload de markdown'
  version: integer("version").notNull(),
  createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// RELACIONES DRIZZLE
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  createdDocuments: many(documents, { relationName: "creator" }),
  revisions: many(documentRevisions),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  category: one(categories, { fields: [documents.categoryId], references: [categories.id] }),
  creator: one(users, { fields: [documents.createdById], references: [users.id], relationName: "creator" }),
  revisions: many(documentRevisions),
  files: many(markdownFiles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

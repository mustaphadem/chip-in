import { z } from "zod";

// ============================================
// User Schemas
// ============================================

export const createUserSchema = z.object({
  email: z.email("Invalid email format"),
  name: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: z.email("Invalid email format").optional(),
  name: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ============================================
// Party Schemas
// ============================================

export const createPartySchema = z.object({
  name: z.string().min(1, "Party name is required"),
  created_by_id: z.uuidv4("created_by_id must be a valid UUID")
});

export type CreatePartyInput = z.infer<typeof createPartySchema>;

export const updatePartySchema = z.object({
  name: z.string().min(1, "Party name is required")
});

export type UpdatePartyInput = z.infer<typeof updatePartySchema>;

// ============================================
// Expense Schemas
// ============================================

export const createExpenseSchema = z.object({
  payer_id: z.uuidv4("payer_id must be a valid UUID"),
  amount: z.union([
    z.number().positive("Amount must be positive"),
    z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  ]),
  reason: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = z.object({
  payer_id: z.uuidv4("payer_id must be a valid UUID").optional(),
  amount: z.union([
    z.number().positive("Amount must be positive"),
    z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  ]).optional(),
  reason: z.string().optional()
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

// ============================================
// Party Member Schemas
// ============================================

export const createPartyMemberSchema = z.object({
  user_id: z.uuidv4("user_id must be a valid UUID"),
  party_id: z.uuidv4("party_id must be a valid UUID"),
});

export type CreatePartyMemberInput = z.infer<typeof createPartyMemberSchema>;

export const updatePartyMemberSchema = z.object({
  user_id: z.uuidv4("user_id must be a valid UUID").optional(),
  party_id: z.uuidv4("party_id must be a valid UUID").optional(),
});

export type UpdatePartyMemberInput = z.infer<typeof updatePartyMemberSchema>;

// ============================================
// Common ID Parameter Schemas
// ============================================

// For parties, expenses, party_members (UUID IDs)
export const uuidParamSchema = z.object({
  id: z.uuidv4("ID must be a valid UUID"),
});

export type UuidParam = z.infer<typeof uuidParamSchema>;

// For expense routes with party_id and expense_id
export const expenseParamsSchema = z.object({
  id: z.uuidv4("Party ID must be a valid UUID"),
  expense_id: z.uuidv4("Expense ID must be a valid UUID"),
});

export type ExpenseParams = z.infer<typeof expenseParamsSchema>;

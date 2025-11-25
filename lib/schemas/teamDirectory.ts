import { z } from 'zod';

export const TeamMemberRoleSchema = z.enum(['Admin', 'Agent', 'Creator']);

export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  role: TeamMemberRoleSchema,
  avatar: z.string().url().nullable(),
});

export const PaginationInfoSchema = z.object({
  currentPage: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
});

export const TeamMembersResponseSchema = z.object({
  data: z.array(TeamMemberSchema),
  pagination: PaginationInfoSchema,
});


import { z } from 'zod';

// Example: User validation schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Add more shared schemas here

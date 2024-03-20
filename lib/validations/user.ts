import * as z from 'zod';

export const UserValidation = z.object({
  profile_photo: z.string().url(),
  name: z.string().min(3, { message: 'Minimum 3 Characters' }).max(30),
  username: z.string().min(3, { message: 'Minimum 3 Characters' }).max(30),
  bio: z.string().min(3, { message: 'Minimum 3 Characters' }).max(1000),
});

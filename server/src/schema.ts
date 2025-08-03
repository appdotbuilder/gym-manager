
import { z } from 'zod';

// Enums
export const userRoleSchema = z.enum(['client', 'trainer', 'admin']);
export const inviteStatusSchema = z.enum(['pending', 'accepted', 'expired']);
export const sessionStatusSchema = z.enum(['scheduled', 'completed', 'cancelled', 'no_show']);
export const workoutTypeSchema = z.enum(['strength', 'cardio', 'yoga', 'pilates', 'crossfit', 'personal_training', 'group_fitness']);
export const dayOfWeekSchema = z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

export type UserRole = z.infer<typeof userRoleSchema>;
export type InviteStatus = z.infer<typeof inviteStatusSchema>;
export type SessionStatus = z.infer<typeof sessionStatusSchema>;
export type WorkoutType = z.infer<typeof workoutTypeSchema>;
export type DayOfWeek = z.infer<typeof dayOfWeekSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().nullable(),
  role: userRoleSchema,
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Client profile schema
export const clientProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  fitness_goals: z.string().nullable(),
  sessions_per_week: z.number().int().nullable(),
  sessions_per_day: z.number().int().nullable(),
  medical_conditions: z.string().nullable(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type ClientProfile = z.infer<typeof clientProfileSchema>;

// Trainer profile schema
export const trainerProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  specializations: z.string().nullable(),
  certifications: z.string().nullable(),
  years_experience: z.number().int().nullable(),
  bio: z.string().nullable(),
  hourly_rate: z.number().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type TrainerProfile = z.infer<typeof trainerProfileSchema>;

// Invite schema
export const inviteSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: userRoleSchema,
  token: z.string(),
  status: inviteStatusSchema,
  invited_by: z.number(),
  expires_at: z.coerce.date(),
  created_at: z.coerce.date(),
  accepted_at: z.coerce.date().nullable()
});

export type Invite = z.infer<typeof inviteSchema>;

// Weekly availability schema
export const weeklyAvailabilitySchema = z.object({
  id: z.number(),
  user_id: z.number(),
  day_of_week: dayOfWeekSchema,
  start_time: z.string(), // Format: "HH:MM"
  end_time: z.string(), // Format: "HH:MM"
  is_available: z.boolean(),
  week_start_date: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type WeeklyAvailability = z.infer<typeof weeklyAvailabilitySchema>;

// Session schema
export const sessionSchema = z.object({
  id: z.number(),
  trainer_id: z.number(),
  client_id: z.number(),
  session_date: z.coerce.date(),
  start_time: z.string(), // Format: "HH:MM"
  end_time: z.string(), // Format: "HH:MM"
  duration: z.number().int(), // Duration in minutes
  workout_type: workoutTypeSchema,
  status: sessionStatusSchema,
  notes: z.string().nullable(),
  created_by: z.number(), // Admin who created the session
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Session = z.infer<typeof sessionSchema>;

// Input schemas for creating entities
export const createInviteInputSchema = z.object({
  email: z.string().email(),
  role: userRoleSchema
});

export type CreateInviteInput = z.infer<typeof createInviteInputSchema>;

export const acceptInviteInputSchema = z.object({
  token: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().nullable(),
  password: z.string().min(8)
});

export type AcceptInviteInput = z.infer<typeof acceptInviteInputSchema>;

export const createClientProfileInputSchema = z.object({
  user_id: z.number(),
  fitness_goals: z.string().nullable(),
  sessions_per_week: z.number().int().nullable(),
  sessions_per_day: z.number().int().nullable(),
  medical_conditions: z.string().nullable(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable()
});

export type CreateClientProfileInput = z.infer<typeof createClientProfileInputSchema>;

export const createTrainerProfileInputSchema = z.object({
  user_id: z.number(),
  specializations: z.string().nullable(),
  certifications: z.string().nullable(),
  years_experience: z.number().int().nullable(),
  bio: z.string().nullable(),
  hourly_rate: z.number().nullable()
});

export type CreateTrainerProfileInput = z.infer<typeof createTrainerProfileInputSchema>;

export const updateWeeklyAvailabilityInputSchema = z.object({
  user_id: z.number(),
  week_start_date: z.coerce.date(),
  availability: z.array(z.object({
    day_of_week: dayOfWeekSchema,
    start_time: z.string(),
    end_time: z.string(),
    is_available: z.boolean()
  }))
});

export type UpdateWeeklyAvailabilityInput = z.infer<typeof updateWeeklyAvailabilityInputSchema>;

export const createSessionInputSchema = z.object({
  trainer_id: z.number(),
  client_id: z.number(),
  session_date: z.coerce.date(),
  start_time: z.string(),
  duration: z.number().int().positive(),
  workout_type: workoutTypeSchema,
  notes: z.string().nullable()
});

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;

export const filterTrainersInputSchema = z.object({
  session_date: z.coerce.date(),
  start_time: z.string(),
  duration: z.number().int().positive(),
  workout_type: workoutTypeSchema.optional()
});

export type FilterTrainersInput = z.infer<typeof filterTrainersInputSchema>;

export const updateSessionStatusInputSchema = z.object({
  session_id: z.number(),
  status: sessionStatusSchema,
  notes: z.string().nullable()
});

export type UpdateSessionStatusInput = z.infer<typeof updateSessionStatusInputSchema>;

// Additional input schemas for TRPC routes
export const getUserProfileInputSchema = z.object({
  userId: z.number()
});

export type GetUserProfileInput = z.infer<typeof getUserProfileInputSchema>;

export const getTrainerAvailabilityInputSchema = z.object({
  trainerId: z.number(),
  weekStartDate: z.coerce.date()
});

export type GetTrainerAvailabilityInput = z.infer<typeof getTrainerAvailabilityInputSchema>;

export const getUserSessionsInputSchema = z.object({
  userId: z.number(),
  role: z.enum(['client', 'trainer'])
});

export type GetUserSessionsInput = z.infer<typeof getUserSessionsInputSchema>;

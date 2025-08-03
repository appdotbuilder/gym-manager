
import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  integer, 
  boolean, 
  pgEnum,
  date,
  numeric,
  unique
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['client', 'trainer', 'admin']);
export const inviteStatusEnum = pgEnum('invite_status', ['pending', 'accepted', 'expired']);
export const sessionStatusEnum = pgEnum('session_status', ['scheduled', 'completed', 'cancelled', 'no_show']);
export const workoutTypeEnum = pgEnum('workout_type', ['strength', 'cardio', 'yoga', 'pilates', 'crossfit', 'personal_training', 'group_fitness']);
export const dayOfWeekEnum = pgEnum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  phone: text('phone'),
  role: userRoleEnum('role').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Client profiles table
export const clientProfilesTable = pgTable('client_profiles', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  fitness_goals: text('fitness_goals'),
  sessions_per_week: integer('sessions_per_week'),
  sessions_per_day: integer('sessions_per_day'),
  medical_conditions: text('medical_conditions'),
  emergency_contact_name: text('emergency_contact_name'),
  emergency_contact_phone: text('emergency_contact_phone'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Trainer profiles table
export const trainerProfilesTable = pgTable('trainer_profiles', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  specializations: text('specializations'),
  certifications: text('certifications'),
  years_experience: integer('years_experience'),
  bio: text('bio'),
  hourly_rate: numeric('hourly_rate', { precision: 10, scale: 2 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Invites table
export const invitesTable = pgTable('invites', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  role: userRoleEnum('role').notNull(),
  token: text('token').notNull().unique(),
  status: inviteStatusEnum('status').notNull().default('pending'),
  invited_by: integer('invited_by').notNull().references(() => usersTable.id),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  accepted_at: timestamp('accepted_at'),
});

// Weekly availability table
export const weeklyAvailabilityTable = pgTable('weekly_availability', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  day_of_week: dayOfWeekEnum('day_of_week').notNull(),
  start_time: text('start_time').notNull(), // Format: "HH:MM"
  end_time: text('end_time').notNull(), // Format: "HH:MM"
  is_available: boolean('is_available').notNull().default(true),
  week_start_date: date('week_start_date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserDayWeek: unique().on(table.user_id, table.day_of_week, table.week_start_date)
}));

// Sessions table
export const sessionsTable = pgTable('sessions', {
  id: serial('id').primaryKey(),
  trainer_id: integer('trainer_id').notNull().references(() => usersTable.id),
  client_id: integer('client_id').notNull().references(() => usersTable.id),
  session_date: date('session_date').notNull(),
  start_time: text('start_time').notNull(), // Format: "HH:MM"
  end_time: text('end_time').notNull(), // Format: "HH:MM"
  duration: integer('duration').notNull(), // Duration in minutes
  workout_type: workoutTypeEnum('workout_type').notNull(),
  status: sessionStatusEnum('status').notNull().default('scheduled'),
  notes: text('notes'),
  created_by: integer('created_by').notNull().references(() => usersTable.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  clientProfile: one(clientProfilesTable, {
    fields: [usersTable.id],
    references: [clientProfilesTable.user_id]
  }),
  trainerProfile: one(trainerProfilesTable, {
    fields: [usersTable.id],
    references: [trainerProfilesTable.user_id]
  }),
  weeklyAvailabilities: many(weeklyAvailabilityTable),
  trainerSessions: many(sessionsTable, { relationName: 'trainer' }),
  clientSessions: many(sessionsTable, { relationName: 'client' }),
  createdSessions: many(sessionsTable, { relationName: 'creator' }),
  sentInvites: many(invitesTable)
}));

export const clientProfilesRelations = relations(clientProfilesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [clientProfilesTable.user_id],
    references: [usersTable.id]
  })
}));

export const trainerProfilesRelations = relations(trainerProfilesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [trainerProfilesTable.user_id],
    references: [usersTable.id]
  })
}));

export const invitesRelations = relations(invitesTable, ({ one }) => ({
  inviter: one(usersTable, {
    fields: [invitesTable.invited_by],
    references: [usersTable.id]
  })
}));

export const weeklyAvailabilityRelations = relations(weeklyAvailabilityTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [weeklyAvailabilityTable.user_id],
    references: [usersTable.id]
  })
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  trainer: one(usersTable, {
    fields: [sessionsTable.trainer_id],
    references: [usersTable.id],
    relationName: 'trainer'
  }),
  client: one(usersTable, {
    fields: [sessionsTable.client_id],
    references: [usersTable.id],
    relationName: 'client'
  }),
  creator: one(usersTable, {
    fields: [sessionsTable.created_by],
    references: [usersTable.id],
    relationName: 'creator'
  })
}));

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  clientProfiles: clientProfilesTable,
  trainerProfiles: trainerProfilesTable,
  invites: invitesTable,
  weeklyAvailability: weeklyAvailabilityTable,
  sessions: sessionsTable
};

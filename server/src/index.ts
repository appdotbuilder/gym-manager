
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createInviteInputSchema,
  acceptInviteInputSchema,
  createClientProfileInputSchema,
  createTrainerProfileInputSchema,
  updateWeeklyAvailabilityInputSchema,
  filterTrainersInputSchema,
  createSessionInputSchema,
  updateSessionStatusInputSchema,
  getUserProfileInputSchema,
  getTrainerAvailabilityInputSchema,
  getUserSessionsInputSchema
} from './schema';

import { createInvite } from './handlers/create_invite';
import { acceptInvite } from './handlers/accept_invite';
import { createClientProfile } from './handlers/create_client_profile';
import { createTrainerProfile } from './handlers/create_trainer_profile';
import { updateWeeklyAvailability } from './handlers/update_weekly_availability';
import { getTrainerAvailability } from './handlers/get_trainer_availability';
import { filterAvailableTrainers } from './handlers/filter_available_trainers';
import { createSession } from './handlers/create_session';
import { getUserSessions } from './handlers/get_user_sessions';
import { updateSessionStatus } from './handlers/update_session_status';
import { getAllClients } from './handlers/get_all_clients';
import { getAllTrainers } from './handlers/get_all_trainers';
import { getUserProfile } from './handlers/get_user_profile';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Invite management
  createInvite: publicProcedure
    .input(createInviteInputSchema)
    .mutation(({ input }) => createInvite(input, 1)), // TODO: Get inviter ID from context

  acceptInvite: publicProcedure
    .input(acceptInviteInputSchema)
    .mutation(({ input }) => acceptInvite(input)),

  // Profile management
  createClientProfile: publicProcedure
    .input(createClientProfileInputSchema)
    .mutation(({ input }) => createClientProfile(input)),

  createTrainerProfile: publicProcedure
    .input(createTrainerProfileInputSchema)
    .mutation(({ input }) => createTrainerProfile(input)),

  getUserProfile: publicProcedure
    .input(getUserProfileInputSchema)
    .query(({ input }) => getUserProfile(input.userId)),

  // Availability management
  updateWeeklyAvailability: publicProcedure
    .input(updateWeeklyAvailabilityInputSchema)
    .mutation(({ input }) => updateWeeklyAvailability(input)),

  getTrainerAvailability: publicProcedure
    .input(getTrainerAvailabilityInputSchema)
    .query(({ input }) => getTrainerAvailability(input.trainerId, input.weekStartDate)),

  // Session management
  filterAvailableTrainers: publicProcedure
    .input(filterTrainersInputSchema)
    .query(({ input }) => filterAvailableTrainers(input)),

  createSession: publicProcedure
    .input(createSessionInputSchema)
    .mutation(({ input }) => createSession(input, 1)), // TODO: Get creator ID from context

  getUserSessions: publicProcedure
    .input(getUserSessionsInputSchema)
    .query(({ input }) => getUserSessions(input.userId, input.role)),

  updateSessionStatus: publicProcedure
    .input(updateSessionStatusInputSchema)
    .mutation(({ input }) => updateSessionStatus(input)),

  // Admin queries
  getAllClients: publicProcedure
    .query(() => getAllClients()),

  getAllTrainers: publicProcedure
    .query(() => getAllTrainers()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();

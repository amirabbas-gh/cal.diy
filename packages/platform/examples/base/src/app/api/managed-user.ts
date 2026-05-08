import { X_CAL_CLIENT_ID, X_CAL_SECRET_KEY } from "@calcom/platform-constants";
import prisma from "../../lib/prismaClient";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/managed-user")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const { emails } = JSON.parse(body);
          const emailOne = emails[0];
          const emailTwo = emails[1];
          const emailThree = emails[2];
          const emailFour = emails[3];
          const emailFive = emails[4];

          const existingUser = await prisma.user.findFirst({ orderBy: { createdAt: "desc" } });
          if (existingUser && existingUser.calcomUserId) {
            return Response.json({
              id: existingUser.calcomUserId,
              email: existingUser.email,
              username: existingUser.calcomUsername ?? "",
              accessToken: existingUser.accessToken ?? "",
            }, { status: 200 });
          }

          const managedUserResponseOne = await createUserWithDefaultSchedule(
            emailOne,
            "Keith",
            "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=3023&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          );
          const managedUserResponseTwo = await createUserWithDefaultSchedule(
            emailTwo,
            "Somay",
            "https://plus.unsplash.com/premium_photo-1668319915476-5cc7717e00f1?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          );
          const managedUserResponseThree = await createUserWithDefaultSchedule(
            emailThree,
            "Rajiv",
            "https://plus.unsplash.com/premium_photo-1668319915476-5cc7717e00f1?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          );
          const managedUserResponseFour = await createUserWithDefaultSchedule(
            emailFour,
            "Morgan",
            "https://plus.unsplash.com/premium_photo-1668319915476-5cc7717e00f1?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          );
          const managedUserResponseFive = await createUserWithDefaultSchedule(
            emailFive,
            "Lauris",
            "https://plus.unsplash.com/premium_photo-1668319915476-5cc7717e00f1?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          );

          // eslint-disable-next-line turbo/no-undeclared-env-vars
          const organizationId = process.env.ORGANIZATION_ID;
          if (!organizationId) {
            throw new Error("Organization ID is not set");
          }

          const team = await createTeam(+organizationId, `Platform devs - ${Date.now()}`);
          if (!team) {
            throw new Error("Failed to create team. Probably your platform team does not have required plan.");
          }

          await createOrgTeamMembershipMember(+organizationId, team.id, managedUserResponseOne.user.id);
          await createOrgTeamMembershipMember(+organizationId, team.id, managedUserResponseTwo.user.id);
          await createOrgTeamMembershipMember(+organizationId, team.id, managedUserResponseThree.user.id);
          await createOrgTeamMembershipMember(+organizationId, team.id, managedUserResponseFour.user.id);

          await createCollectiveEventType(+organizationId, team.id, [
            managedUserResponseOne.user.id,
            managedUserResponseTwo.user.id,
            managedUserResponseThree.user.id,
            managedUserResponseFour.user.id,
          ]);

          await createRoundRobinEventType(+organizationId, team.id, [
            managedUserResponseOne.user.id,
            managedUserResponseTwo.user.id,
            managedUserResponseThree.user.id,
            managedUserResponseFour.user.id,
          ]);

          await createManagedEventType(+organizationId, team.id, [
            managedUserResponseOne.user.id,
            managedUserResponseTwo.user.id,
            managedUserResponseThree.user.id,
            managedUserResponseFour.user.id,
          ]);

          await createOrgMembershipAdmin(+organizationId, managedUserResponseFive.user.id);

          return Response.json({
            id: managedUserResponseOne?.user?.id,
            email: (managedUserResponseOne.user.email as string) ?? "",
            username: (managedUserResponseOne.user.username as string) ?? "",
            accessToken: (managedUserResponseOne.accessToken as string) ?? "",
          }, { status: 200 });
      },
    },
  },
});

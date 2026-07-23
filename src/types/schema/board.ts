import type { roleEnum } from "~/db/schema";

export type BoardRoleType = (typeof roleEnum.enumValues)[number];

import bcrypt from "bcryptjs";
import db from "./index";
import {
  activitiesTable,
  boardMembersTable,
  boardsTable,
  columnsTable,
  tasksTable,
  usersTable,
} from "./schema";

const PASSWORD = "@J0K4M354icui4cu";
const DAY = 86400000;
const COLUMNS = ["Todo", "In Progress", "Review", "Done"];

const USERS = [
  { key: "john", name: "John Doe", email: "john@example.com" },
  { key: "jane", name: "Jane Smith", email: "jane@example.com" },
  { key: "budi", name: "Budi Santoso", email: "budi@example.com" },
  { key: "siti", name: "Siti Aminah", email: "siti@example.com" },
  { key: "david", name: "David Johnson", email: "david@example.com" },
  { key: "sara", name: "Sara Lee", email: "sara@example.com" },
];

const BOARDS = [
  {
    title: "AI Development",
    description: "Developing the new AI feature for the app.",
    color: "#4A90E2",
    owner: "john",
    members: ["jane", "budi", "siti"],
    updatedDaysAgo: 0.5,
    tasks: [
      "Gather training data",
      "Preprocess dataset",
      "Train initial model",
      "Evaluate model performance",
      "Fine-tune hyperparameters",
      "Deploy model to staging",
      "Integrate AI with backend API",
      "Write unit tests for AI endpoints",
      "Create frontend UI for AI feature",
      "End-to-end testing",
    ],
  },
  {
    title: "Marketing Campaign Q4",
    description: "Planning and execution of the end of year campaign.",
    color: "#E24A4A",
    owner: "jane",
    members: ["siti", "david"],
    updatedDaysAgo: 1.5,
    tasks: [
      "Define campaign goals",
      "Identify target audience",
      "Create ad creatives",
      "Write email copy",
      "Set up tracking links",
      "Launch social media ads",
      "Monitor campaign performance",
      "Analyze ROI",
    ],
  },
  {
    title: "Website Overhaul",
    description: "Redesigning the main landing page and about us page.",
    color: "#50E3C2",
    owner: "john",
    members: ["budi", "sara"],
    updatedDaysAgo: 3.2,
    tasks: [
      "Create wireframes",
      "Design mockups",
      "Review designs with stakeholders",
      "Develop new components",
      "Optimize images",
      "Ensure mobile responsiveness",
      "Run accessibility tests",
      "Deploy to production",
    ],
  },
  {
    title: "Customer Support Improvements",
    description: "Enhancing support workflows and documentation.",
    color: "#F5A623",
    owner: "siti",
    members: ["david", "sara"],
    updatedDaysAgo: 5.0,
    tasks: [
      "Review current support tickets",
      "Identify common issues",
      "Update FAQs",
      "Create new help center articles",
      "Implement chatbot for basic queries",
      "Train support team on new features",
    ],
  },
  {
    title: "Infrastructure Upgrade",
    description: "Migrating to a new cloud provider and updating databases.",
    color: "#9013FE",
    owner: "budi",
    members: ["john", "david"],
    updatedDaysAgo: 0.2,
    tasks: [
      "Assess current infrastructure",
      "Select new cloud provider",
      "Plan migration strategy",
      "Set up new servers",
      "Migrate databases",
      "Update DNS records",
      "Monitor system stability",
      "Decommission old servers",
    ],
  },
];

const COL_CYCLE = [0, 1, 1, 2, 3, 0, 2, 3, 1, 3, 0, 1];
const PRIO_CYCLE = ["medium", "high", "low", "urgent", "medium", "high", "low", "urgent"];
const DUE_CYCLE = [-9, 2, null, 5, -2, 14, 1, null, 20, -4, 6, 9, 3, null, 12, -1, 7];

const seed = async () => {
  console.log("🌱 Starting database seeding...");

  try {
    let taskTotal = 0;
    await db.transaction(async (tx) => {
      console.log("🧹 Clearing existing data...");
      await tx.delete(activitiesTable);
      await tx.delete(tasksTable);
      await tx.delete(columnsTable);
      await tx.delete(boardMembersTable);
      await tx.delete(boardsTable);
      await tx.delete(usersTable);

      const hash = await bcrypt.hash(PASSWORD, 10);
      const uid: Record<string, string> = {};

      console.log("👤 Seeding users...");
      const insertedUsers = await tx
        .insert(usersTable)
        .values(
          USERS.map((u) => ({
            name: u.name,
            email: u.email.toLowerCase(),
            password: hash,
          })),
        )
        .returning();

      for (let i = 0; i < USERS.length; i++) {
        const user = USERS[i];
        const inserted = insertedUsers[i];
        if (!user || !inserted) throw new Error("User or insertedUser is undefined");
        uid[user.key] = inserted.id;
      }

      console.log("📋 Seeding boards, columns, members, and tasks...");
      for (const b of BOARDS) {
        const ownerId = uid[b.owner];
        if (!ownerId) throw new Error(`Owner ID not found for ${b.owner}`);

        const insertedBoards = await tx
          .insert(boardsTable)
          .values({
            title: b.title,
            description: b.description,
            color: b.color,
            ownerId: ownerId,
          })
          .returning();
        const boardId = insertedBoards[0]?.id;
        if (!boardId) throw new Error("Failed to insert board");

        let memberKeys = [b.owner, ...b.members];
        if (!memberKeys.includes("john")) memberKeys.push("john");
        memberKeys = [...new Set(memberKeys)];

        const membersToInsert = memberKeys.map((mk, mi) => {
          const userId = uid[mk];
          if (!userId) throw new Error(`User ID not found for ${mk}`);
          return {
            boardId: boardId,
            userId: userId,
            role: (mk === b.owner ? "owner" : mi === 1 ? "admin" : "member") as
              | "owner"
              | "admin"
              | "member",
          };
        });
        await tx.insert(boardMembersTable).values(membersToInsert);

        const colIds: string[] = [];
        const columnsToInsert = COLUMNS.map((col, i) => ({
          boardId: boardId,
          title: col,
          position: (i + 1) * 1000,
        }));
        const insertedCols = await tx.insert(columnsTable).values(columnsToInsert).returning();
        for (const col of insertedCols) {
          colIds.push(col.id);
        }

        const assignPool = ["john", "john", ...memberKeys];

        const tasksToInsert = b.tasks.map((taskTitle, i) => {
          const colIdx = COL_CYCLE[i % COL_CYCLE.length];
          if (colIdx === undefined) throw new Error("Invalid column index");

          const priority = PRIO_CYCLE[(i + b.title.length) % PRIO_CYCLE.length] as
            | "low"
            | "medium"
            | "high"
            | "urgent";
          const offset = DUE_CYCLE[(i + b.tasks.length) % DUE_CYCLE.length];
          const dueDate =
            offset === null || offset === undefined ? null : new Date(Date.now() + offset * DAY);
          const assigneeKey = i % 5 === 4 ? null : assignPool[i % assignPool.length];
          const assigneeId = assigneeKey ? uid[assigneeKey] : null;
          if (assigneeKey && !assigneeId)
            throw new Error(`Assignee ID not found for ${assigneeKey}`);

          const columnId = colIds[colIdx];
          if (!columnId) throw new Error(`Column ID not found for index ${colIdx}`);

          return {
            boardId: boardId,
            columnId: columnId,
            title: taskTitle,
            description: i % 3 === 0 ? `${taskTitle} - details and acceptance criteria.` : null,
            priority: priority,
            dueDate: dueDate,
            assigneeId: assigneeId,
            position: (i + 1) * 1000,
            createdBy: ownerId,
          };
        });

        if (tasksToInsert.length > 0) {
          await tx.insert(tasksTable).values(tasksToInsert);
          taskTotal += tasksToInsert.length;
        }

        const ownerName = USERS.find((u) => u.key === b.owner)?.name || "Unknown";
        const movedMemberName =
          USERS.find((u) => u.key === memberKeys[1] || u.key === b.owner)?.name || ownerName;

        const acts = [
          { action: "board.created", message: `${ownerName} created the board` },
          {
            action: "task.created",
            message: `${ownerName} added "${b.tasks[0]}"`,
          },
          {
            action: "task.moved",
            message: `${movedMemberName} moved "${b.tasks[Math.min(3, b.tasks.length - 1)]}" to Done`,
          },
        ];

        const activitiesToInsert = acts.map((act) => ({
          boardId: boardId,
          userId: ownerId,
          action: act.action,
          message: act.message,
        }));

        await tx.insert(activitiesTable).values(activitiesToInsert);
      }

      // Pass taskTotal outside transaction by logging inside or storing it
      console.log(
        `    Users:  ${USERS.length}  .  Boards: ${BOARDS.length}  .  Tasks: ${taskTotal}`,
      );
    });

    console.log("✅ Demo workspace seeded.");
    console.log(`    Users:  ${USERS.length}  .  Boards: ${BOARDS.length}  .  Tasks: ${taskTotal}`);
    console.log("    Login:  john@example.com  /  @J0K4M354icui4cu");
    console.log("    (teammates share the same password)");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();

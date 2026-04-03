-- CreateTable
CREATE TABLE "_ClassParticipants" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ClassParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "class_schedules" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ClassParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduleId" INTEGER,
    CONSTRAINT "attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attendance_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attendance_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "class_schedules" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_attendance" ("createdAt", "date", "id", "ownerId", "status", "studentId") SELECT "createdAt", "date", "id", "ownerId", "status", "studentId" FROM "attendance";
DROP TABLE "attendance";
ALTER TABLE "new_attendance" RENAME TO "attendance";
CREATE INDEX "attendance_ownerId_idx" ON "attendance"("ownerId");
CREATE INDEX "attendance_studentId_idx" ON "attendance"("studentId");
CREATE TABLE "new_class_schedules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" INTEGER NOT NULL,
    "studentId" INTEGER,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "class_schedules_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "class_schedules_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_class_schedules" ("createdAt", "dayOfWeek", "endTime", "id", "ownerId", "startTime", "studentId") SELECT "createdAt", "dayOfWeek", "endTime", "id", "ownerId", "startTime", "studentId" FROM "class_schedules";
DROP TABLE "class_schedules";
ALTER TABLE "new_class_schedules" RENAME TO "class_schedules";
CREATE INDEX "class_schedules_ownerId_idx" ON "class_schedules"("ownerId");
CREATE INDEX "class_schedules_studentId_idx" ON "class_schedules"("studentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_ClassParticipants_AB_unique" ON "_ClassParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassParticipants_B_index" ON "_ClassParticipants"("B");

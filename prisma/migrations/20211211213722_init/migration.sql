-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('PASSIVE', 'ACTIVE', 'ENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCustomer" (
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "UserChauffeur" (
    "userId" INTEGER NOT NULL,
    "carModel" TEXT NOT NULL,
    "carPlateNumber" TEXT NOT NULL,
    "seatCount" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "lastRingNodeTimeId" INTEGER
);

-- CreateTable
CREATE TABLE "UserChauffeurRingNodeTime" (
    "id" SERIAL NOT NULL,
    "chauffeurId" INTEGER NOT NULL,
    "ringNodeId" INTEGER NOT NULL,
    "time" TIME(6) NOT NULL,

    CONSTRAINT "UserChauffeurRingNodeTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ring" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RingNode" (
    "id" SERIAL NOT NULL,
    "ringId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RingNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRide" (
    "id" SERIAL NOT NULL,
    "status" "RideStatus" NOT NULL,
    "customerUserId" INTEGER NOT NULL,
    "startChauffeurRingNodeTimeId" INTEGER NOT NULL,
    "endChauffeurRingNodeTimeId" INTEGER NOT NULL,
    "seatCount" INTEGER NOT NULL,

    CONSTRAINT "UserRide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCustomer_userId_key" ON "UserCustomer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserChauffeur_userId_key" ON "UserChauffeur"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserChauffeur_lastRingNodeTimeId_key" ON "UserChauffeur"("lastRingNodeTimeId");

-- AddForeignKey
ALTER TABLE "UserCustomer" ADD CONSTRAINT "UserCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChauffeur" ADD CONSTRAINT "UserChauffeur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChauffeur" ADD CONSTRAINT "UserChauffeur_lastRingNodeTimeId_fkey" FOREIGN KEY ("lastRingNodeTimeId") REFERENCES "UserChauffeurRingNodeTime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChauffeurRingNodeTime" ADD CONSTRAINT "UserChauffeurRingNodeTime_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "UserChauffeur"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChauffeurRingNodeTime" ADD CONSTRAINT "UserChauffeurRingNodeTime_ringNodeId_fkey" FOREIGN KEY ("ringNodeId") REFERENCES "RingNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RingNode" ADD CONSTRAINT "RingNode_ringId_fkey" FOREIGN KEY ("ringId") REFERENCES "Ring"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRide" ADD CONSTRAINT "UserRide_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "UserCustomer"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRide" ADD CONSTRAINT "UserRide_startChauffeurRingNodeTimeId_fkey" FOREIGN KEY ("startChauffeurRingNodeTimeId") REFERENCES "UserChauffeurRingNodeTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRide" ADD CONSTRAINT "UserRide_endChauffeurRingNodeTimeId_fkey" FOREIGN KEY ("endChauffeurRingNodeTimeId") REFERENCES "UserChauffeurRingNodeTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

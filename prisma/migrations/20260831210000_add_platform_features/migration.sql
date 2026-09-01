CREATE TYPE "UserRole" AS ENUM ('CLIENT','FREELANCER','ADMIN');
CREATE TYPE "JobStatus" AS ENUM ('OPEN','CLOSED','DRAFT');
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING','ACCEPTED','REJECTED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING','APPROVED','REJECTED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL, "fullName" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL, "phone" TEXT, "bio" TEXT, "skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "portfolioUrl" TEXT, "avatarUrl" TEXT, "isPremium" BOOLEAN NOT NULL DEFAULT false, "premiumUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "Job" (
  "id" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT NOT NULL, "budget" INTEGER NOT NULL,
  "status" "JobStatus" NOT NULL DEFAULT 'OPEN', "clientId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Application" (
  "id" TEXT NOT NULL, "jobId" TEXT NOT NULL, "freelancerId" TEXT NOT NULL, "coverLetter" TEXT NOT NULL,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Application_jobId_freelancerId_key" ON "Application"("jobId","freelancerId");
CREATE TABLE "Message" (
  "id" TEXT NOT NULL, "senderId" TEXT NOT NULL, "receiverId" TEXT NOT NULL, "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Message_senderId_receiverId_createdAt_idx" ON "Message"("senderId","receiverId","createdAt");
CREATE TABLE "Upload" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "filename" TEXT NOT NULL, "url" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL, "size" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Payment" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "reference" TEXT NOT NULL, "plan" TEXT NOT NULL DEFAULT 'Premium AI Access',
  "amount" INTEGER NOT NULL, "currency" TEXT NOT NULL DEFAULT 'NGN', "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "receiptUrl" TEXT, "receiptFilename" TEXT, "adminNote" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3), "reviewedById" TEXT, CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status","createdAt");
ALTER TABLE "Job" ADD CONSTRAINT "Job_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

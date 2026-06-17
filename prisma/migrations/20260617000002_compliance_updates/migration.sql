-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Level" ADD VALUE 'L3';
ALTER TYPE "Level" ADD VALUE 'L4';
ALTER TYPE "Level" ADD VALUE 'L5';
ALTER TYPE "Level" ADD VALUE 'L6';
ALTER TYPE "Level" ADD VALUE 'IC4';
ALTER TYPE "Level" ADD VALUE 'IC5';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Currency" ADD VALUE 'GBP';
ALTER TYPE "Currency" ADD VALUE 'EUR';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Source" ADD VALUE 'CONTRIBUTOR';
ALTER TYPE "Source" ADD VALUE 'SCRAPED';
ALTER TYPE "Source" ADD VALUE 'AI_INFERRED';

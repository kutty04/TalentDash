import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/compare
 * Compares two salary records by UUID.
 * Returns both records and a calculated delta comparison object.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const s1 = searchParams.get('s1');
    const s2 = searchParams.get('s2');

    // 1. Validation Checks
    if (!s1 || !s2) {
      return NextResponse.json(
        { error: true, message: 'Both s1 and s2 parameters are required.' },
        { status: 400 }
      );
    }

    if (s1 === s2) {
      return NextResponse.json(
        { error: true, message: 'Cannot compare a salary record with itself.' },
        { status: 400 }
      );
    }

    // 2. Fetch records in parallel
    const [record1, record2] = await Promise.all([
      prisma.salary.findUnique({
        where: { id: s1 },
        include: { company: true },
      }),
      prisma.salary.findUnique({
        where: { id: s2 },
        include: { company: true },
      }),
    ]);

    if (!record1 || !record2) {
      return NextResponse.json(
        { error: true, message: 'One or both salary records could not be found.' },
        { status: 404 }
      );
    }

    // 3. Compute Delta Differentials (Record 1 - Record 2)
    const base_delta = record1.base_salary - record2.base_salary;
    const bonus_delta = record1.bonus - record2.bonus;
    const stock_delta = record1.stock - record2.stock;
    const tc_delta = record1.total_compensation - record2.total_compensation;
    const experience_delta = record1.experience_years - record2.experience_years;

    return NextResponse.json({
      record1,
      record2,
      delta: {
        base_delta,
        bonus_delta,
        stock_delta,
        tc_delta,
        experience_delta,
      },
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: 'An unexpected server error occurred during comparison.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validateSalaryInput } from '@/lib/services/validation';
import { createSalary } from '@/lib/services/salary-service';

export const runtime = 'nodejs';

/**
 * POST /api/ingest-salary
 * Ingests a new salary submission, applies normalization, validates, calculates total compensation,
 * checks for duplicates, and creates a database record.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate Input Data
    const validationResult = validateSalaryInput(body);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: true,
          field: validationResult.error.field,
          message: validationResult.error.message,
        },
        { status: 400 }
      );
    }

    // 2. Insert via Service Layer (Includes normalization, TC calculation, duplicate checks)
    const newSalary = await createSalary(validationResult.data);

    // 3. Return successfully created record
    return NextResponse.json(
      {
        success: true,
        data: newSalary,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Check if the service threw a duplicate entry exception (409 Conflict)
    if (error.message && error.message.includes('Duplicate entry')) {
      return NextResponse.json(
        {
          error: true,
          message: error.message,
        },
        { status: 409 }
      );
    }

    // Catch generic/unexpected errors
    return NextResponse.json(
      {
        error: true,
        message: 'An unexpected server error occurred while processing your request.',
      },
      { status: 500 }
    );
  }
}

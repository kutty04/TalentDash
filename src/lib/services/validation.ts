import { Level, Currency, Source } from '@prisma/client';

export interface ValidatedSalaryInput {
  company: string;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  source: Source;
  confidence_score?: number;
}

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult =
  | { valid: true; data: ValidatedSalaryInput }
  | { valid: false; error: ValidationError };

/**
 * Validates the raw input object for creating a new Salary entry.
 * Follows the sequential validation pipeline: Required checks -> Types -> Enums -> Business Ranges.
 * Returns only the FIRST error encountered.
 */
export function validateSalaryInput(raw: any): ValidationResult {
  // 1. Required Fields Check
  const requiredFields = [
    'company',
    'role',
    'level',
    'location',
    'currency',
    'experience_years',
    'base_salary',
  ];

  for (const field of requiredFields) {
    if (raw[field] === undefined || raw[field] === null || raw[field] === '') {
      return {
        valid: false,
        error: { field, message: `Field '${field}' is required and cannot be empty.` },
      };
    }
  }

  // 2. Type Validation Checks
  if (typeof raw.company !== 'string') {
    return {
      valid: false,
      error: { field: 'company', message: "Company name must be a string." },
    };
  }
  if (typeof raw.role !== 'string') {
    return {
      valid: false,
      error: { field: 'role', message: "Role must be a string." },
    };
  }
  if (typeof raw.location !== 'string') {
    return {
      valid: false,
      error: { field: 'location', message: "Location must be a string." },
    };
  }

  // Experience and salaries type conversions/type check
  const experienceYears = Number(raw.experience_years);
  if (isNaN(experienceYears) || !Number.isInteger(experienceYears)) {
    return {
      valid: false,
      error: { field: 'experience_years', message: "Experience years must be an integer." },
    };
  }

  const baseSalary = Number(raw.base_salary);
  if (isNaN(baseSalary) || !Number.isInteger(baseSalary)) {
    return {
      valid: false,
      error: { field: 'base_salary', message: "Base salary must be an integer." },
    };
  }

  // Bonus and stock default to 0 if not provided
  const bonus = raw.bonus !== undefined && raw.bonus !== null && raw.bonus !== '' ? Number(raw.bonus) : 0;
  if (isNaN(bonus) || !Number.isInteger(bonus)) {
    return {
      valid: false,
      error: { field: 'bonus', message: "Bonus must be an integer." },
    };
  }

  const stock = raw.stock !== undefined && raw.stock !== null && raw.stock !== '' ? Number(raw.stock) : 0;
  if (isNaN(stock) || !Number.isInteger(stock)) {
    return {
      valid: false,
      error: { field: 'stock', message: "Stock must be an integer." },
    };
  }

  // Source default check
  let source = raw.source;
  if (source === undefined || source === null || source === '') {
    source = Source.ANONYMOUS_USER;
  }

  // 3. Enum Validation Checks
  // Normalize hyphenated Level formats e.g. "SDE-I" -> "SDE_I"
  const levelString = String(raw.level).trim().toUpperCase().replace('-', '_');
  const validLevels = Object.values(Level) as string[];
  if (!validLevels.includes(levelString)) {
    return {
      valid: false,
      error: {
        field: 'level',
        message: `Invalid level '${raw.level}'. Supported levels: ${validLevels.join(', ')}.`,
      },
    };
  }
  const level = levelString as Level;

  const validCurrencies = Object.values(Currency) as string[];
  if (!validCurrencies.includes(String(raw.currency).toUpperCase())) {
    return {
      valid: false,
      error: {
        field: 'currency',
        message: `Invalid currency '${raw.currency}'. Supported currencies: ${validCurrencies.join(', ')}.`,
      },
    };
  }
  const currency = String(raw.currency).toUpperCase() as Currency;

  const validSources = Object.values(Source) as string[];
  if (!validSources.includes(String(source).toUpperCase())) {
    return {
      valid: false,
      error: {
        field: 'source',
        message: `Invalid source '${source}'. Supported sources: ${validSources.join(', ')}.`,
      },
    };
  }
  const verifiedSource = String(source).toUpperCase() as Source;

  // 4. Business Value Constraints Checks
  if (baseSalary <= 0) {
    return {
      valid: false,
      error: { field: 'base_salary', message: "Base salary must be greater than 0." },
    };
  }

  if (bonus < 0) {
    return {
      valid: false,
      error: { field: 'bonus', message: "Bonus cannot be negative." },
    };
  }

  if (stock < 0) {
    return {
      valid: false,
      error: { field: 'stock', message: "Stock cannot be negative." },
    };
  }

  if (experienceYears < 0 || experienceYears > 50) {
    return {
      valid: false,
      error: {
        field: 'experience_years',
        message: "Experience years must be between 0 and 50.",
      },
    };
  }

  let confidenceScore = 1.0;
  if (raw.confidence_score !== undefined && raw.confidence_score !== null) {
    const score = Number(raw.confidence_score);
    if (isNaN(score) || score < 0.0 || score > 1.0) {
      return {
        valid: false,
        error: {
          field: 'confidence_score',
          message: "Confidence score must be a decimal value between 0.0 and 1.0.",
        },
      };
    }
    confidenceScore = score;
  }

  return {
    valid: true,
    data: {
      company: raw.company.trim(),
      role: raw.role.trim(),
      level,
      location: raw.location.trim(),
      currency,
      experience_years: experienceYears,
      base_salary: baseSalary,
      bonus,
      stock,
      source: verifiedSource,
      confidence_score: confidenceScore,
    },
  };
}

/**
 * Normalizes raw company names into a standard format.
 * Trims whitespace, lowercases, and strips legal suffixes like "Pvt Ltd", "Inc", "LLC", "Ltd".
 */
export function normalizeCompanyName(raw: string): { normalizedName: string; slug: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { normalizedName: '', slug: '' };
  }

  // Normalize by: lowercasing, stripping punctuation, and removing legal/corporate suffixes
  let cleaned = trimmed.toLowerCase();
  
  // Strip legal suffixes
  const suffixes = [
    /\bpvt\s+ltd\b/gi,
    /\bpvt\.?\s*ltd\.?\b/gi,
    /\blimited\b/gi,
    /\bltd\.?\b/gi,
    /\binc\.?\b/gi,
    /\bllc\.?\b/gi,
    /\bcorporation\b/gi,
    /\bcorp\.?\b/gi,
    /\bco\.?\b/gi,
  ];

  for (const pattern of suffixes) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Strip trailing/leading whitespace and special characters
  cleaned = cleaned.trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();

  // Alias lookup table mapping
  const aliases: Record<string, string> = {
    'tata consultancy services': 'tcs',
    'tata consultancy': 'tcs',
    'tcs limited': 'tcs',
    'tcs ltd': 'tcs',
    'amazon web services': 'amazon',
    'aws': 'amazon',
    'infosys bpo': 'infosys',
    'wipro technologies': 'wipro',
    'flipkart internet': 'flipkart',
  };

  if (aliases[cleaned]) {
    cleaned = aliases[cleaned];
  }

  // Generate slug: replace spaces with hyphens
  const slug = cleaned.replace(/\s+/g, '-').trim();

  return {
    normalizedName: cleaned,
    slug,
  };
}

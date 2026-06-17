import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validateSalaryInput, normalizeCompanyName } from '../lib/services/validation';
import { Level, Currency, Source } from '@prisma/client';

describe('TalentDash Compliance Unit Tests', () => {
  describe('normalizeCompanyName', () => {
    test('should trim spaces and remove legal/corporate suffixes', () => {
      const cases = [
        { raw: ' Google Inc. ', expectedName: 'google', expectedSlug: 'google' },
        { raw: 'Amazon Web Services, LLC', expectedName: 'amazon', expectedSlug: 'amazon' },
        { raw: 'Tata Consultancy Services Pvt Ltd', expectedName: 'tcs', expectedSlug: 'tcs' },
        { raw: 'Infosys BPO', expectedName: 'infosys', expectedSlug: 'infosys' },
        { raw: 'Wipro Technologies Corporation', expectedName: 'wipro', expectedSlug: 'wipro' },
        { raw: 'Flipkart Internet Private Limited', expectedName: 'flipkart', expectedSlug: 'flipkart' },
      ];

      for (const { raw, expectedName, expectedSlug } of cases) {
        const { normalizedName, slug } = normalizeCompanyName(raw);
        assert.strictEqual(normalizedName, expectedName);
        assert.strictEqual(slug, expectedSlug);
      }
    });
  });

  describe('validateSalaryInput level normalization', () => {
    test('should normalize legacy and compliance level formats', () => {
      const baseInput = {
        company: 'Google',
        role: 'Software Engineer',
        location: 'Bengaluru',
        currency: 'INR',
        experience_years: 3,
        base_salary: 2000000,
        bonus: 100000,
        stock: 100000,
        source: 'CONTRIBUTOR',
      };

      const cases = [
        { inputLevel: 'SDE-I', expected: Level.SDE_I },
        { inputLevel: 'SDE I', expected: Level.SDE_I },
        { inputLevel: 'SDE_I', expected: Level.SDE_I },
        { inputLevel: 'SDE-II', expected: Level.SDE_II },
        { inputLevel: 'SDE-III', expected: Level.SDE_III },
        { inputLevel: 'Staff', expected: Level.STAFF },
        { inputLevel: 'Principal', expected: Level.PRINCIPAL },
        { inputLevel: 'L3', expected: Level.L3 },
        { inputLevel: 'L4', expected: Level.L4 },
        { inputLevel: 'L5', expected: Level.L5 },
        { inputLevel: 'L6', expected: Level.L6 },
        { inputLevel: 'IC-4', expected: Level.IC4 },
        { inputLevel: 'IC4', expected: Level.IC4 },
        { inputLevel: 'IC-5', expected: Level.IC5 },
        { inputLevel: 'IC5', expected: Level.IC5 },
      ];

      for (const { inputLevel, expected } of cases) {
        const res = validateSalaryInput({ ...baseInput, level: inputLevel });
        assert.ok(res.valid, `Failed on level format: ${inputLevel}`);
        if (res.valid) {
          assert.strictEqual(res.data.level, expected);
        }
      }
    });

    test('should reject unsupported levels', () => {
      const input = {
        company: 'Google',
        role: 'Software Engineer',
        level: 'L7',
        location: 'Bengaluru',
        currency: 'INR',
        experience_years: 3,
        base_salary: 2000000,
        source: 'CONTRIBUTOR',
      };
      const res = validateSalaryInput(input);
      assert.strictEqual(res.valid, false);
      if (!res.valid) {
        assert.strictEqual(res.error.field, 'level');
      }
    });
  });

  describe('validateSalaryInput currency and source validation', () => {
    test('should accept GBP and EUR currencies', () => {
      const baseInput = {
        company: 'Google',
        role: 'Software Engineer',
        level: 'L3',
        location: 'London',
        experience_years: 1,
        base_salary: 65000,
        source: 'CONTRIBUTOR',
      };

      const resGBP = validateSalaryInput({ ...baseInput, currency: 'GBP' });
      assert.ok(resGBP.valid);
      if (resGBP.valid) {
        assert.strictEqual(resGBP.data.currency, Currency.GBP);
      }

      const resEUR = validateSalaryInput({ ...baseInput, currency: 'EUR' });
      assert.ok(resEUR.valid);
      if (resEUR.valid) {
        assert.strictEqual(resEUR.data.currency, Currency.EUR);
      }
    });

    test('should support new sources and fallback to CONTRIBUTOR', () => {
      const baseInput = {
        company: 'Google',
        role: 'Software Engineer',
        level: 'L3',
        location: 'London',
        currency: 'GBP',
        experience_years: 1,
        base_salary: 65000,
      };

      // No source provided - should default to CONTRIBUTOR
      const resDefault = validateSalaryInput(baseInput);
      assert.ok(resDefault.valid);
      if (resDefault.valid) {
        assert.strictEqual(resDefault.data.source, Source.CONTRIBUTOR);
      }

      // Explicit SCRAPED
      const resScraped = validateSalaryInput({ ...baseInput, source: 'SCRAPED' });
      assert.ok(resScraped.valid);
      if (resScraped.valid) {
        assert.strictEqual(resScraped.data.source, Source.SCRAPED);
      }

      // Explicit AI_INFERRED
      const resAI = validateSalaryInput({ ...baseInput, source: 'AI_INFERRED' });
      assert.ok(resAI.valid);
      if (resAI.valid) {
        assert.strictEqual(resAI.data.source, Source.AI_INFERRED);
      }
    });
  });

  describe('validateSalaryInput business logic checks', () => {
    const validRaw = {
      company: 'Google',
      role: 'Software Engineer',
      level: 'L3',
      location: 'Bengaluru',
      currency: 'INR',
      experience_years: 2,
      base_salary: 1500000,
    };

    test('should reject negative experience or experience > 50', () => {
      const negExp = validateSalaryInput({ ...validRaw, experience_years: -1 });
      assert.strictEqual(negExp.valid, false);

      const highExp = validateSalaryInput({ ...validRaw, experience_years: 51 });
      assert.strictEqual(highExp.valid, false);
    });

    test('should reject non-positive base salary', () => {
      const zeroSalary = validateSalaryInput({ ...validRaw, base_salary: 0 });
      assert.strictEqual(zeroSalary.valid, false);

      const negSalary = validateSalaryInput({ ...validRaw, base_salary: -100 });
      assert.strictEqual(negSalary.valid, false);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar');

      expect(result).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const result = cn('foo', true && 'bar', false && 'baz');

      expect(result).toBe('foo bar');
    });

    it('should handle Tailwind merge conflicts', () => {
      // Tailwind merge should resolve conflicts
      const result = cn('px-2', 'px-4');

      // Should keep the last one (px-4)
      expect(result).toContain('px-4');
      expect(result).not.toContain('px-2');
    });

    it('should handle undefined and null', () => {
      const result = cn('foo', undefined, null, 'bar');

      expect(result).toBe('foo bar');
    });

    it('should handle empty strings', () => {
      const result = cn('foo', '', 'bar');

      expect(result).toBe('foo bar');
    });

    it('should handle arrays', () => {
      const result = cn(['foo', 'bar'], 'baz');

      expect(result).toBe('foo bar baz');
    });

    it('should handle objects', () => {
      const result = cn({
        foo: true,
        bar: false,
        baz: true,
      });

      expect(result).toBe('foo baz');
    });

    it('should handle complex combinations', () => {
      const result = cn(
        'base-class',
        true && 'conditional-class',
        false && 'hidden-class',
        ['array-class-1', 'array-class-2'],
        {
          'object-true': true,
          'object-false': false,
        },
        undefined,
        null
      );

      expect(result).toContain('base-class');
      expect(result).toContain('conditional-class');
      expect(result).toContain('array-class-1');
      expect(result).toContain('array-class-2');
      expect(result).toContain('object-true');
      expect(result).not.toContain('hidden-class');
      expect(result).not.toContain('object-false');
    });
  });
});

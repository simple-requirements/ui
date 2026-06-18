import { describe, expect, it } from 'vitest'
import { categoryKeys, mapHttpError, normalizeVisibleKey, projectKeys, requirementKeys } from '../../src/App'

describe('backend workspace helpers', () => {
  it('defines stable query keys', () => {
    expect(projectKeys.all).toEqual(['projects'])
    expect(categoryKeys.all).toEqual(['categories'])
    expect(requirementKeys.list('p1')).toEqual(['requirements', 'list', 'p1'])
    expect(requirementKeys.detail('r1')).toEqual(['requirements', 'detail', 'r1'])
    expect(requirementKeys.byVisibleKey('FR-1')).toEqual(['requirements', 'visible-key', 'FR-1'])
  })
  it('normalizes exact visible keys', () => expect(normalizeVisibleKey(' fr-1 ')).toBe('FR-1'))
  it('maps backend errors', () => {
    expect(mapHttpError(400, { message: 'bad', errors: { name: 'required' } }).kind).toBe('validation')
    expect(mapHttpError(403, {}).kind).toBe('accessDenied')
    expect(mapHttpError(404, {}).kind).toBe('notFound')
    expect(mapHttpError(409, {}).kind).toBe('conflict')
    expect(mapHttpError(500, {}).kind).toBe('unexpected')
  })
})

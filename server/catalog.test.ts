import { describe, expect, it } from 'vitest'
import { announcedFreeShipping } from './catalog'

const END = '2026-11-04T23:59:59+01:00'
const BEFORE = Date.parse('2026-10-28T12:00:00+01:00')
const AFTER = Date.parse('2026-11-05T00:00:00+01:00')

describe('livraison offerte annoncée', () => {
  it('est annoncée jusqu’à sa date de fin', () => {
    expect(announcedFreeShipping(END, [0], BEFORE)).toBe(END)
  })

  it('disparaît d’elle-même une fois la date passée', () => {
    expect(announcedFreeShipping(END, [0], AFTER)).toBeNull()
  })

  it('n’est jamais annoncée si la livraison est payante ou sans date', () => {
    expect(announcedFreeShipping(END, [490], BEFORE)).toBeNull()
    expect(announcedFreeShipping(END, [0, 490], BEFORE)).toBeNull()
    expect(announcedFreeShipping(null, [0], BEFORE)).toBeNull()
    expect(announcedFreeShipping('pas une date', [0], BEFORE)).toBeNull()
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFakeTimers, setSystemTime } from 'vi'
import { TickTimer } from '../tick_timer.ts'

let t0 = undefined

beforeEach(() => {
  vi.useFakeTimers()
  t0 = Date.now()
  vi.setSystemTime(t0)
})

describe('TickTimer', () => {
  it('should construct correctly', () => {
    const total_minutes = 10
    let timer = new TickTimer(total_minutes)
    expect(timer.started).toEqual(false)
    expect(timer.total_ms).toEqual(600000)
    expect(timer.elapsed_ms).toEqual(0)
    expect(timer.last_tick).toEqual(t0)
  })
  it('should clone correctly', () => {
    let timer = new TickTimer(0)
    timer.started = true
    timer.total_ms = 12345
    timer.elapsed_ms = 6789
    timer.last_tick = 13579
    let cloned_timer = timer.Clone()
    expect(cloned_timer.started).toEqual(true)
    expect(cloned_timer.total_ms).toEqual(12345)
    expect(cloned_timer.elapsed_ms).toEqual(6789)
    expect(cloned_timer.last_tick).toEqual(13579)
  })
  it('should parse from object correctly', () => {
    let timer = new TickTimer(0)
    timer.started = true
    timer.total_ms = 12345
    timer.elapsed_ms = 6789
    timer.last_tick = 13579
    const obj = JSON.parse(JSON.stringify(timer))
    let parsed_timer = TickTimer.ParseFromObject(obj)
    expect(parsed_timer.started).toEqual(true)
    expect(parsed_timer.total_ms).toEqual(12345)
    expect(parsed_timer.elapsed_ms).toEqual(6789)
    expect(parsed_timer.last_tick).toEqual(13579)
  })
  it('should not elapse when stopped', () => {
    let timer = new TickTimer(10)
    expect(timer.started).toEqual(false)
    vi.setSystemTime(t0 + 60)
    expect(timer.GetElapsedMs()).toEqual(0)
    vi.setSystemTime(t0 + 120)
    expect(timer.GetElapsedMs()).toEqual(0)
  })
  it('should elapse when started', () => {
    let timer = new TickTimer(10)
    timer.Start()
    expect(timer.started).toEqual(true)
    vi.setSystemTime(t0 + 60)
    expect(timer.GetElapsedMs()).toEqual(60)
    vi.setSystemTime(t0 + 120)
    expect(timer.GetElapsedMs()).toEqual(120)
  })
  it('should get left time correctly', () => {
    let timer = new TickTimer(10)
    timer.Start()
    expect(timer.started).toEqual(true)
    vi.setSystemTime(t0 + 60 * 1000)
    expect(timer.GetElapsedMs()).toEqual(60 * 1000)
    expect(timer.TimeLeftMs()).toEqual(9 * 60 * 1000)
  })
  it('should count elapsed time correctly with multiple toggles', () => {
    // T=0
    let timer = new TickTimer(10)
    expect(timer.started).toEqual(false)
    // T=60, start
    vi.setSystemTime(t0 + 60)
    timer.Toggle()
    expect(timer.started).toEqual(true)
    expect(timer.GetElapsedMs()).toEqual(0)
    // T=75, stop, elapsed = 15
    vi.setSystemTime(t0 + 75)
    timer.Toggle()
    expect(timer.started).toEqual(false)
    expect(timer.GetElapsedMs()).toEqual(15)
    // T=120, start, elapsed = 15
    vi.setSystemTime(t0 + 120)
    timer.Toggle()
    expect(timer.started).toEqual(true)
    expect(timer.GetElapsedMs()).toEqual(15)
    // T=220, start, elapsed = 115
    vi.setSystemTime(t0 + 220)
    timer.Toggle()
    expect(timer.started).toEqual(false)
    expect(timer.GetElapsedMs()).toEqual(115)
  })
  it('should indicate when time is up', () => {
    // T=0
    let timer = new TickTimer(10)
    expect(timer.started).toEqual(false)
    timer.Start()
    expect(timer.TimeIsUp()).toEqual(false)
    // T=9min
    vi.setSystemTime(t0 + 9 * 60 * 1000)
    expect(timer.GetElapsedMs()).toEqual(9 * 60 * 1000)
    expect(timer.TimeIsUp()).toEqual(false)
    // T=10min
    vi.setSystemTime(t0 + 10 * 60 * 1000)
    expect(timer.GetElapsedMs()).toEqual(10 * 60 * 1000)
    expect(timer.TimeIsUp()).toEqual(true)
    // T=20min
    vi.setSystemTime(t0 + 20 * 60 * 1000)
    expect(timer.GetElapsedMs()).toEqual(20 * 60 * 1000)
    expect(timer.TimeIsUp()).toEqual(true)
  })
})

export class TickTimer {
  started: boolean
  total_ms: number
  elapsed_ms: number
  last_tick: number | undefined

  constructor(total_minutes: number) {
    this.started = false
    this.total_ms = total_minutes * 60 * 1000
    this.elapsed_ms = 0
    this.Tick()
  }

  // Makes a clone from another Timer instance
  Clone(): TickTimer {
    let clone_instance = new TickTimer(0)
    clone_instance.started = this.started
    clone_instance.total_ms = this.total_ms
    clone_instance.elapsed_ms = this.elapsed_ms
    clone_instance.last_tick = this.last_tick
    return clone_instance
  }

  // Makes a TickTimer instance from an object, this method does not verify the object fields. It is the caller's responsiblity to make sure the input object is a valid one.
  static ParseFromObject(obj: any): TickTimer {
    let parsed_instance = new TickTimer(0)
    parsed_instance.started = obj.started
    parsed_instance.total_ms = obj.total_ms
    parsed_instance.elapsed_ms = obj.elapsed_ms
    parsed_instance.last_tick = obj.last_tick
    return parsed_instance
  }

  // Update tick time to now, and maybe elapsed time
  Tick() {
    const time_now = Date.now()
    if (this.started) {
      this.elapsed_ms += time_now - this.last_tick
    }
    this.last_tick = time_now
  }

  Start() {
    if (this.started) {
      return
    }
    this.Tick()
    this.started = true
  }

  Stop() {
    if (!this.started) {
      return
    }
    this.Tick()
    this.started = false
  }

  Toggle() {
    if (this.started) {
      this.Stop()
    } else {
      this.Start()
    }
  }

  GetElapsedMs(): number {
    this.Tick()
    return this.elapsed_ms
  }

  TimeIsUp(): boolean {
    this.Tick()
    return this.total_ms <= this.elapsed_ms
  }

  TimeLeftMs(): number {
    return this.total_ms - this.GetElapsedMs()
  }
}

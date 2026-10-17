export abstract class Entity {
  constructor(readonly id: string) {}

  equals(other: Entity): boolean {
    return this.constructor === other.constructor && this.id === other.id
  }
}

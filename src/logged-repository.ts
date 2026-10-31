import { LogCall } from "./log-call";
import type { Ticket } from "./models";
import { InMemoryRepository } from "./repository";
import type { Result } from "./result";

export class LoggedTicketRepository extends InMemoryRepository<Ticket> {
  @LogCall()
  override update(id: number, patch: Partial<Omit<Ticket, "id">>): Result<Ticket> {
    return super.update(id, patch);
  }
}

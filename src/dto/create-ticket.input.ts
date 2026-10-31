import type { Priority } from "../models";
import { IsIn, MaxLength, Required } from "../validation";

export class CreateTicketInput {
  @Required()
  @MaxLength(80)
  title!: string;

  @MaxLength(500)
  description?: string;

  @Required()
  @IsIn(["low", "medium", "high", "critical"])
  priority!: Priority;

  @Required()
  authorId!: number;

  static from(data: Partial<Record<keyof CreateTicketInput, unknown>>): CreateTicketInput {
    return Object.assign(new CreateTicketInput(), data);
  }
}

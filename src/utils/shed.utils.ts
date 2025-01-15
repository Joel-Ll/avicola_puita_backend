import { EventState, eventState } from "src/common/constants/event-state";

export class ShedUtils {
  public static calculateWeek(startDate: Date, eventDate: Date): number {
    const diffTime = eventDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  }

  public static validateEventDate(date: Date): boolean {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date >= currentDate
  }

  public static setStatusEvent(date: Date, currentState: string): EventState {
    const dateEvent = new Date(date).setHours(0, 0, 0, 0);
    const currentDate = new Date().setHours(0, 0, 0, 0);

    if (currentState === eventState.COMPLETED) {
      return eventState.COMPLETED;
    }

    if (dateEvent < currentDate) {
      return eventState.EXPIRED;
    }

    return eventState.PENDING;
  }
}
import { IsInt, Matches, Max, Min } from 'class-validator';

export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateAvailabilityDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @Matches(TIME_REGEX, { message: 'startTime debe tener formato HH:MM' })
  startTime!: string;

  @Matches(TIME_REGEX, { message: 'endTime debe tener formato HH:MM' })
  endTime!: string;
}
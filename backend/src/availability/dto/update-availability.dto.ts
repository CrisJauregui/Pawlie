import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { TIME_REGEX } from './create-availability.dto';

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @Matches(TIME_REGEX, { message: 'startTime debe tener formato HH:MM' })
  startTime?: string;

  @IsOptional()
  @Matches(TIME_REGEX, { message: 'endTime debe tener formato HH:MM' })
  endTime?: string;
}
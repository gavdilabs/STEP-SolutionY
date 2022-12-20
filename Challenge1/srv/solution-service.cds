using { schema } from '../db/schema';

service solutionService {
    entity ProjectSet as projection on schema.Project;
    entity UserSet as projection on schema.User;
    entity WorkScheduleSet as projection on schema.WorkSchedule;
    entity WorkHoursSet as projection on schema.WorkHours;
}
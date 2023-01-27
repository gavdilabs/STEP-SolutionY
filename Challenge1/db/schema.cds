using { cuid, sap, managed, temporal} from '@sap/cds/common';

namespace schema;

entity Project : cuid, managed{
    workhours: Association to many WorkHours on workhours.project = $self;
    ProjectName: String not null;
    StartDate: Date  @cds.valid.from not null;
    EndDate: Date @cds.valid.to not null;
    MaxHours: Double not null;
    RegisteredHours: Double;
    
}

entity User : cuid {
    workschedule: Association to many WorkSchedule on workschedule.user = $self;
    workhours: Association to many WorkHours on workhours.user = $self;
    Username: String(12);
    FirstName: String(24);
    LastName: String(24);
    //Image : LargeBinary @Core.MediaType : 'image/png';
    Title: String;
}

type WorkDay : Integer64 enum {
    SUN = 0;
    MON = 1;
    TUE = 2;
    WED = 3;
    THU = 4;
    FRI = 5;
    SAT = 6; 
}

entity DaySchedule : cuid, managed{
    WorkSchedule: Association to one WorkSchedule;
    StartTime: Time;
    EndTime: Time; 
    WeekDay: WorkDay;
}

entity WorkSchedule : cuid{
    user: Association to User; // Backlink
    //WeekDay: String;
    StartTime: Time;
    EndTime: Time;
    EffectiveStartDate: Date; //@cds.valid.from;
    EffectiveEndDate: Date; //@cds.valid.to;
}

entity WorkHours : cuid,managed{
    project: Association to Project;
    user: Association to User; // Backlink
    Day: Date;
    StartTime: DateTime;
    EndTime: DateTime;
}
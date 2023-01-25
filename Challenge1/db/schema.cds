using { cuid, sap, managed, temporal} from '@sap/cds/common';

namespace schema;

entity Project : cuid, managed{
    workhours: Association to many WorkHours on workhours.project = $self;
    ProjectName: String;
    StartDate: Date  @cds.valid.from;
    EndDate: Date @cds.valid.to;
    MaxHours: Double;
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
    MON = 0;
    TUE = 1;
    WED = 2;
    THU = 3;
    FRI = 4;
    SAT = 5;
    SUN = 6; 
}

entity WorkSchedule : cuid{
    user: Association to User; // Backlink
    WeekDay: String;
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
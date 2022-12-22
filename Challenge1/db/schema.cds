using { cuid, sap, managed, temporal } from '@sap/cds/common';

namespace schema;

entity Project : cuid,managed{
    //key ID: UUID;
    workhours: Association to many WorkHours on workhours.project = $self;
    ProjectName: String;
    StartDate: Date @cds.valid.from;
    EndDate: Date @cds.valid.to;
    MaxHours: Double;
    //modifiedBy : UUID @cds.on.insert: $user @cds.on.update: $user;
    //modifiedAt : Timestamp @cds.on.insert: $now  @cds.on.update: $now;
}

entity User : cuid {
    //Key ID: UUID;
    workschedule: Association to many WorkSchedule on workschedule.user = $self;
    workhours: Association to many WorkHours on workhours.user = $self;
    Username: String;
    FirstName: String;
    LastName: String;
    //Image : LargeBinary @Core.MediaType: 'image/png';
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
    //Key ID: UUID;
    user: Association to User; // Backlink
    WeekDay: String;
    StartTime: Time;
    EndTime: Time;
    EffectiveStartDate: Date @cds.valid.from;
    EffectiveEndDate: Date @cds.valid.to;
}

entity WorkHours : cuid,managed{
    //Key ID: UUID;
    project: Association to Project;
    user: Association to User; // Backlink
    Day: Date;
    StartTime: Time;
    EndTime: Time;
    //modifiedBy : UUID @cds.on.insert: $user @cds.on.update: $user;
    //modifiedAt : Timestamp @cds.on.insert: $now  @cds.on.update: $now;
}
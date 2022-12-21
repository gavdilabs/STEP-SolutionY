
namespace schema;

entity Project {
    key ID: UUID;
    workhours: Association to many WorkHours on workhours.project = $self;
    ProjectName: String;
    StartDate: Date @cds.valid.from;
    EndDate: Date @cds.valid.to;
    MaxHours: Double;
    modifiedBy : UUID @cds.on.insert: $user @cds.on.update: $user;
    modifiedAt : Timestamp @cds.on.insert: $now  @cds.on.update: $now;
}

entity User {
    Key ID: UUID;
    workschedule: Association to many WorkSchedule on workschedule.user = $self;
    workhours: Association to many WorkHours on workhours.user = $self;
    Username: String;
    FirstName: String;
    LastName: String;
    //Image : LargeBinary @Core.MediaType: 'image/png';
    Title: String;
}

entity WorkSchedule {
    Key ID: UUID;
    user: Association to User; // Backlink
    WeekDay: String;
    StartTime: Time;
    EndTime: Time;
    StartDate: Date @cds.valid.from;
    EndDate: Date @cds.valid.to;
}

entity WorkHours {
    Key ID: UUID;
    project: Association to Project;
    user: Association to User; // Backlink
    Day: String;
    StartTime: Time;
    EndTime: Time;
    modifiedBy : UUID @cds.on.insert: $user @cds.on.update: $user;
    modifiedAt : Timestamp @cds.on.insert: $now  @cds.on.update: $now;
}
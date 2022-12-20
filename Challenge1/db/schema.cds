
namespace schema;

entity Project {
    key ID: UUID;
    workhours: Association to WorkHours;
    ProjectName: String;
    StartDate: String;//Date @cds.valid.from;
    EndDate: String;//Date @cds.valid.to;
    MaxHours: Double;
    // ChangeInfo ModifiedBy;
}

entity User {
    Key ID: UUID;
    workschedule: Association to many WorkSchedule on workschedule.user = $self;
    workhours: Association to many WorkHours on workhours.user = $self;
    Username: String;
    FirstName: String;
    LastName: String;
    //Picture: LargeBinary @Core.MediaType: 'image/png';
    Title: String;
}

entity WorkSchedule {
    //Key ID: UUID;
    user: Association to User; // Backlink
    WeekDay: String;
    StartTime: Double;
    EndTime: Double;
    StartDate: Double;
    EndDate: Double;
}

entity WorkHours {
    //Key ID: UUID;
    project: Association to many Project on project.workhours = $self; // Backlink
    user: Association to User; // Backlink
    Day: String;
    StartTime: Double;
    EndTime: Double;
    // ChangeInfo ModifiedBy;
}
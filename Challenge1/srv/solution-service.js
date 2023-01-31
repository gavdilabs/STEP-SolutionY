const cds = require('@sap/cds');

module.exports = async function(srv) {
    const {WorkHoursSet, ProjectSet, UserSet, WorkScheduleSet, DayScheduleSet, AbsenceSet} = srv.entities;

    //Slight user restrictions in the form of no spaces in username and no numbers in first name or last name.
    srv.before('CREATE', 'UserSet', async (req) => {
        const Username = req.data["Username"];
        if (Username.includes(" ")){
            req.reject(400, 'Cannot include space');
        }
        const FirstName = req.data["FirstName"];
        if (FirstName.includes("1","2","3","4","5","6","7","8","9","0")){
            req.reject(400, 'First name cannot include numbers');
        }
        const LastName = req.data["LastName"];
        if (LastName.includes("1","2","3","4","5","6","7","8","9","0")){
            req.reject(400, 'Last name cannot include numbers');
        }
    })

    /* Logic for only allowing registering of hours within validity period of project. 
    Project data is requested through a custom filter which finds the correct project through its respective ID. 
    Lastly the handler compares the StartTime and EndTime of the registered WorkHours together with the 
    StartDate and EndDate of the Project. */
    srv.before('CREATE', 'WorkHoursSet', async (req)=>{
        const db = srv.transaction(req);
        // const project = await db.get(ProjectSet).byKey({ID: req.data.project_ID});
        const filter = await db.get(ProjectSet).where({"ID": req.data["project_ID"]});
        const currentProjectEntity = filter[0];

        const startTime = new Date(req.data["StartTime"]);
        const endTime = new Date (req.data["EndTime"]);
        const projectStartDate = new Date(currentProjectEntity["StartDate"]);
        const projectEndDate = new Date(currentProjectEntity["EndDate"]);
        if (startTime < projectStartDate || endTime > projectEndDate ) {
            req.reject(400, "Cannot register hours outside valid project hours");
        }
    })
        
    
    /* Logic for insuring that WorkHours cannot be registered if the maximum number of hours for a project have been
    reached. Handler gets the appropiate project key, as well as StartTime and EndTime in hour format from WorkHours. 
    A new projects RegisteredHours should always start at 0.0 and then the calculatedHours can be added to that.
    */
    srv.before('CREATE', 'WorkHoursSet', async (req)=>{
        const db = srv.transaction(req);
        const project = await db.get(ProjectSet).byKey({ID: req.data.project_ID});

        const startTime = new Date(req.data["StartTime"]).getHours();
        const endTime = new Date (req.data["EndTime"]).getHours();

        //The 'const calculatedHours' calculates the amount of hours registered.
        const calculatedHours = endTime-startTime;
        if(!project.RegisteredHours) project.RegisteredHours = 0.0; 

        /*If "calculatedHours + RegisteredHours" is less than the maximum hours for a project
        it should reject the request.*/
        if(calculatedHours + project.RegisteredHours > project.MaxHours) {
            req.reject(400, "Maximum hours for this project has already been reached");
            return;
        }
        
        //Lastly the projects RegisteredHours is updated in the database.
        project.RegisteredHours += calculatedHours;
        await db.update(ProjectSet).byKey({ID: project.ID}).with(project);
    })
    
    /* Logic for checking if there have been a minimum of 11 hours since last time registration for the same user.
    The handler compares if the newly registered WorkHours 'createdAt time' is >= the previous logged hours - 11, 
    while also taking the user_ID into consideration. */
    srv.before('CREATE', 'WorkHoursSet', async (req) => {
        const db = srv.transaction(req); 
        const current = new Date();
        const prevDate = new Date().setHours(current.getHours()-11); 

        const prevRecords = await cds.run(SELECT.from(WorkHoursSet).where(`user_ID = '${req.data.user_ID}' and createdAt >= ${prevDate}`));

        const entriesExists = prevRecords.length > 0;
        if (entriesExists){
            req.reject (400, "11 hours have not passed since last registration");
        }
    })  

    // Custom logic to create an entity for each day in the workSchedule
    srv.after('CREATE', 'WorkScheduleSet', async (req) =>{
        const db = srv.transaction(req);
        
        const EffectiveStartDate = new Date(req.EffectiveStartDate);
        const EffectiveEndDate = new Date(req.EffectiveEndDate);
        let dates = [];
        let validDays = [];
        let currentDate = EffectiveStartDate;

        // Make an array for all the dates the user has put as input and call it "dates".
        while(currentDate <= EffectiveEndDate){
            dates.push(new Date(currentDate));

            currentDate.setDate(currentDate.getDate()+1);
        }
        // loop through the "dates" array, and convert each date into a day, push those days into a new array called "validDays".
        for (let i = 0; i < dates.length; i++){
            let date = dates[i];
            let day = date.getDay();
            validDays.push(day);
            console.log(validDays);
        }

        /* "validDays" is an array of ints where each day represents and integer, sunday = 0 monday = 1, etc
        loop through that array, and set the respective "StartTime" and "EndTime" for those days and create
        an entity out of each day. Give them all the same ID, to distinguish which DaySchedule belongs to which user. */
        for (let i = 0; i <validDays.length; i++){
            switch(validDays[i]){
                case 0:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {
                            WorkSchedule_ID: req.ID,
                            StartTime: '00:00:00',
                            EndTime: '00:00:00',
                            WeekDay : 0
                        }
                    ]));
                    continue;
                case 1:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {             
                            WorkSchedule_ID: req.ID,              
                            StartTime: '08:00:00',
                            EndTime: '16:00:00',
                            WeekDay : 1
                        }
                    ]));
                    continue;
                case 2:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {           
                            WorkSchedule_ID: req.ID,                
                            StartTime: '08:00:00',
                            EndTime: '16:00:00',
                            WeekDay : 2
                        }
                    ]));
                    continue;
                case 3:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {        
                            WorkSchedule_ID: req.ID,                    
                            StartTime: '08:00:00',
                            EndTime: '16:00:00',
                            WeekDay : 3
                        }
                    ]));
                    continue;
                case 4:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {        
                            WorkSchedule_ID: req.ID,                    
                            StartTime: '08:00:00',
                            EndTime: '16:00:00',
                            WeekDay : 4
                        }
                    ]));
                    continue;
                case 5:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {     
                            WorkSchedule_ID: req.ID,                       
                            StartTime: '08:00:00',
                            EndTime: '14:00:00',
                            WeekDay : 5
                        }
                    ]));
                    continue;
                case 6:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {     
                            WorkSchedule_ID: req.ID,                       
                            StartTime: '00:00:00',
                            EndTime: '00:00:00',
                            WeekDay : 6
                        }
                    ]));
                    continue;
                default:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {
                            WorkSchedule_ID: req.ID,
                            StartTime: '00:00:00',
                            EndTime: '00:00:00',
                            WeekDay : 0
                        }
                    ]));
                    continue;
            }
        }
    })
    /* Here the user can set their absence, but only inside viable working hours. */
    srv.before('CREATE', 'AbsenceSet', async (req) =>{
        /*The user sets a "StartDate" and "EndDate" for when he is going to be absent. We take that date, and
        make a new variable out of them to also get the time for when tey are going to be absent. Finally we 
        also make a variable for the current day that date is, and convert it to a string*/
        const StartDate = new Date(req.data["absenceStartTime"]);
        const EndDate = new Date(req.data["absenceEndTime"]);
        const StartTime = StartDate.getTime();
        const EndTime = EndDate.getTime();
        const Day = StartDate.getDay().toString();

        /* The user inputs a workschedule_ID which belongs to that user. Then we return all those days, where
        that workschedule_ID holds true for that user and create an array out of all those daySchedule entities*/
        const daySchedules = await cds.run(SELECT.from(DayScheduleSet).where((`workschedule_ID = '${req.data.workschedule_ID}'`)))
        
        /* Loop through each daySchedule entity and find the day which corresponds with the day, the user has 
        inputted*/
        let daySchedule; 
            for(const el of daySchedules) {
                if(el.WeekDay !== Day)
                continue; 
            daySchedule = el;
            }
            /*StartTime and EndTime from daySchedule are 08:00:00, but they should be in Epoch time
            therefore we have to convert them to that, since StartTime and EndTime from Absence is in 
            Epoch time */
            const FromTime = daySchedule.StartTime.split(':');
            const ToTime = daySchedule.EndTime.split(':');
            const workHourStartTime = new Date(StartDate);
            const workHourEndTime = new Date(EndDate);
            workHourStartTime.setHours(parseInt(FromTime[0]),parseInt(FromTime[1]),parseInt(FromTime[2]));
            workHourEndTime.setHours(parseInt(ToTime[0]),parseInt(ToTime[1]),parseInt(ToTime[2]));

        /* if the StartTime and EndTime are NOT within the expected working hours for that day, return an error*/
        
        if (!(StartTime >= workHourStartTime.getTime() && StartTime < workHourEndTime.getTime() && EndTime > workHourStartTime.getTime() && EndTime <= workHourEndTime.getTime())){
            console.log(StartTime, EndTime,workHourStartTime.getTime() , workHourEndTime.getTime());    
            req.reject(400, "Cannot register outside workhours");
        }
    })
}

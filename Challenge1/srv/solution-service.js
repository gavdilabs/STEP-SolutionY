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
    srv.before('CREATE', 'WorkHoursSet', async (req)=>{
        const db = srv.transaction(req);
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
        
    
        //max hours custom logic
    srv.before('CREATE', 'WorkHoursSet', async (req)=>{
        const db = srv.transaction(req);
        const project = await db.get(ProjectSet).byKey({ID: req.data.project_ID});

        const startTime = new Date(req.data["StartTime"]).getHours();
        const endTime = new Date (req.data["EndTime"]).getHours();
        
        const calculatedHours = endTime-startTime;
        if(!project.RegisteredHours) project.RegisteredHours = 0.0; 

        if(calculatedHours + project.RegisteredHours > project.MaxHours) {
            req.reject(400, "Maximum hours for this project has already been reached");
            return;
        }
        
        project.RegisteredHours += calculatedHours;
        await db.update(ProjectSet).byKey({ID: project.ID}).with(project);
    })
        //11hours passed logic
    srv.before('CREATE', 'WorkHoursSet', async (req) => {
        const db = srv.transaction(req); //måske slet
        const current = new Date();
        const prevDate = new Date().setHours(current.getHours()-11); //husk -11

        const prevRecords = await cds.run(SELECT.from(WorkHoursSet).where(`user_ID = '${req.data.user_ID}' and createdAt >= ${prevDate}`));

        const entriesExists = prevRecords.length > 0;
        if (entriesExists){
            req.reject (400, "11 hours have not passed since last registration");
        }
    })  
        //Custom logic to create an entity for each day in the workSchedule
    srv.after('CREATE', 'WorkScheduleSet', async (req) =>{
        const db = srv.transaction(req);
        //const user = await db.get(UserSet).byKey({ID: req.data.user_ID});
        
        
        const EffectiveStartDate = new Date(req.EffectiveStartDate);
        const EffectiveEndDate = new Date(req.EffectiveEndDate);
        let dates = [];
        let validDays = [];
        let currentDate = EffectiveStartDate;

        while(currentDate <= EffectiveEndDate){
            dates.push(new Date(currentDate));

            currentDate.setDate(currentDate.getDate()+1);
        }

        for (let i = 0; i < dates.length; i++){
            let date = dates[i];
            let day = date.getDay();
            validDays.push(day);
            console.log(validDays);
        }

        

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
                            StartTime: '00:08:00',
                            EndTime: '00:16:00',
                            WeekDay : 1
                        }
                    ]));
                    continue;
                case 2:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {           
                            WorkSchedule_ID: req.ID,                
                            StartTime: '00:08:00',
                            EndTime: '00:16:00',
                            WeekDay : 2
                        }
                    ]));
                    continue;
                case 3:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {        
                            WorkSchedule_ID: req.ID,                    
                            StartTime: '00:08:00',
                            EndTime: '00:16:00',
                            WeekDay : 3
                        }
                    ]));
                    continue;
                case 4:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {        
                            WorkSchedule_ID: req.ID,                    
                            StartTime: '00:08:00',
                            EndTime: '00:16:00',
                            WeekDay : 4
                        }
                    ]));
                    continue;
                case 5:
                    await cds.run(INSERT.into(DayScheduleSet).entries([
                        {     
                            WorkSchedule_ID: req.ID,                       
                            StartTime: '00:08:00',
                            EndTime: '00:14:00',
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

    srv.before('CREATE', 'AbsenceSet', async (req) =>{
        const StartDate = new Date(req.data["absenceStartTime"]);
        const EndDate = new Date(req.data["absenceEndTime"]);
        const StartTime = StartDate.getTime();
        const EndTime = EndDate.getTime();
        const Day = StartDate.getDay().toString();
        const daySchedules = await cds.run(SELECT.from(DayScheduleSet).where((`workschedule_ID = '${req.data.workschedule_ID}'`)))
        

        let daySchedule; 
            for(const el of daySchedules) {
                if(el.WeekDay !== Day)
                continue; 
            daySchedule = el;
            }
        if (!(StartTime > daySchedule.StartTime && StartTime < daySchedule.EndTime && EndTime > daySchedule.StartTime && EndTime < daySchedule.EndTime)){
            req.reject(400, "Cannot register outside workhours");
        }
        

    })

}

const cds = require('@sap/cds');

module.exports = async function(srv) {
    const {WorkHoursSet, ProjectSet, UserSet, WorkScheduleSet} = srv.entities;

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

    srv.before('CREATE', 'WorkHoursSet', async (req)=>{
        const db = srv.transaction(req);
        const project = await db.get(ProjectSet).byKey({ID: req.data.project_ID});

        const startTime = new Date(req.data["StartTime"]).getHours();
        const endTime = new Date (req.data["EndTime"]).getHours();
        /*if (endTime.getHours() == 23){
            calculatedHours = (endTime+24)-startTime;
            return;
        } else {
            calculatedHours = endTime-startTime;
        }
        */
        
        const calculatedHours = endTime-startTime;
        if(!project.RegisteredHours) project.RegisteredHours = 0.0; 

        if(calculatedHours + project.RegisteredHours > project.MaxHours) {
            req.reject(400, "Dummy!");
            return;
        }
        
        project.RegisteredHours += calculatedHours;
        await db.update(ProjectSet).byKey({ID: project.ID}).with(project);
    })
    
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

    srv.before('CREATE', 'WorkScheduleSet', async (req) =>{
        const db = srv.transaction(req);
        const user = await db.get(UserSet).byKey({ID: req.data.user_ID});
        
        const EffectiveStartDate = new Date(req.data["EffectiveStartDate"]);
        const EffectiveEndDate = new Date(req.data["EffectiveEndDate"]);
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
                    req.data.DaySchedule["StartTime"] = '00:00:00';
                    req.data.DaySchedule["EndTime"] = '00:00:00';
                    await db.update(WDayScheduleSet).byKey({ID:user.ID}).with(user);
                    continue;
                case 1:
                    req.data["StartTime"] = '08:00:00';
                    req.data["EndTime"] = '16:00:00';
                    await db.update(WorkScheduleSet).byKey({ID:user.ID}).with(user);
                    continue;
                case 2:
                    req.data["StartTime"] = '08:00:00';
                    req.data["EndTime"] = '16:00:00';
                    await db.update(WorkScheduleSet).byKey({ID:user.ID}).with(user);
                    continue;
                case 3:
                    req.data["StartTime"] = '08:00:00';
                    req.data["EndTime"] = '16:00:00';
                    await db.update(WorkScheduleSet).byKey({ID:user.ID}).with(user);
                    continue;
                case 4:
                    req.data["StartTime"] = '08:00:00';
                    req.data["EndTime"] = '16:00:00';
                    await db.update(WorkScheduleSet).byKey({ID:user.ID}).with(user);
                    continue;
                case 5:
                    req.data["StartTime"] = '08:00:00';
                    req.data["EndTime"] = '14:00:00';
                    await db.update(WorkScheduleSet).byKey({ID:user.ID}).with(user);
                    continue;
                case 6:
                    req.data["StartTime"] = '00:00:00';
                    req.data["EndTime"] = '00:00:00';
                    await db.update(WorkScheduleSet).byKey({ID:user.ID}).with(user);
                    continue;
                default:
                    req.data["StartTime"] = '00:00:00';
                    req.data["EndTime"] = '00:00:00';
                    continue;
            }
           
        }

    })
}

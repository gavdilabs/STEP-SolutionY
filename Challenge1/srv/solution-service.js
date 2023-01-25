const cds = require('@sap/cds');

module.exports = async function(srv) {
    const {WorkHoursSet, ProjectSet} = srv.entities;

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
}

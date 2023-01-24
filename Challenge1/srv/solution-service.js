const cds = require('@sap/cds');

module.exports = async function(srv) {
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

    //Make sure that there is at least 11 hours between time registrations on the same user.
    srv.before('CREATE', 'WorkHours', async (req) => {
        const WorkHours = req.data["StartTime", "EndTime"];
        for (let i = 0; i < x; i++){
            let StartTime = StartTime;
            let EndTime = EndTime;
            if(EndTime - StartTime < 11){
                req.reject(400,"11 hours have not passed since last registration");
            }
        }
    })
}

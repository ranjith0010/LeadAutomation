var exports = module.exports = {};
var rp = require('request-promise');
var db = require('./db');
var moment = require('moment');

var leadOptions = {
    method: 'POST',
    uri: 'https://api.leadsquared.com/v2/LeadManagement.svc/Leads.RecentlyModified?accessKey=u$re12bb28d38be37e77023027df17b9817&secretKey=59dce764514669ac1c1cec8f47bd5050d664158f',
    body: {
        Parameter: {
            "FromDate": moment().format('YYYY-MM-DD') + " 00:00:00",
            "ToDate": moment().format('YYYY-MM-DD') + " 23:59:00"
        },
        "Columns": {
            "Include_CSV": "ProspectID,FirstName,LastName,EmailAddress,CreatedOn,LastModifiedOn,OwnerId,Source,OwnerIdName,ProspectStage,ModifiedOn"
        },
        "Paging": {
            "PageIndex": 1,
            "PageSize": 1000
        }
    },
    json: true
};

exports.getLeads = function (req, res) {
    rp(leadOptions)
        .then(function (parsedBody) {
            if (parsedBody.RecordCount > 0) {
                db.connect(db.MODE_TEST, function () {
                    var data = {
                        tables: {
                            leads: [],
                            LeadOwner: [],
                        }
                    };
                    var owners = [];
                    for (var i = 0; i < parsedBody.Leads.length; i++) {
                        var lead = parsedBody.Leads[i].LeadPropertyList;
                        var leadData = getLeadData(lead);
                        var leadId = getValue(lead, "ProspectID");
                        data.tables.leads.push(leadData);
                        ownerId = getValue(lead, "OwnerId");
                        if (owners.indexOf(ownerId) == -1) {
                            data.tables.LeadOwner.push({LeadOwnerId: ownerId, FullName: getValue(lead, "OwnerIdName")});
                            owners.push(ownerId);
                        }
                    }
                    db.fixtures(data, function (err) {
                        if (err) {
                            res.end("failed to upload data");
                            return console.log(err);
                        }
                        console.log('Data has been loaded...')
                        res.json(data);
                    });
                });
            }
        })
        .error(function (err) {
            console.log(err);
            res.end("unable to load data from leadsquared");
        })
};

exports.getUsers = function (req, res) {
    rp('https://api.leadsquared.com/v2/UserManagement.svc/Users.Get?accessKey=u$re12bb28d38be37e77023027df17b9817&secretKey=59dce764514669ac1c1cec8f47bd5050d664158f')
        .then(function (parsedData) {
            console.log(parsedData);
            res.json(parsedData);
        })
        .catch(function (error) {
            console.log(error);
            res.end(error);
        });
    res.end("error");
};

function getValue(list, property) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Attribute == property) {
            return list[i].Value;
        }
    }
    return "";
}

function getLeadData(lead) {
    var temp = {
        LeadId: getValue(lead, "ProspectID"),
        FullName: getValue(lead, "FirstName") + " " + (getValue(lead, "LastName") ? getValue(lead, "LastName") : ""),
        Email: getValue(lead, "EmailAddress"),
        LeadCreationDate: getValue(lead, "CreatedOn"),
        LeadupdatedDate: getValue(lead, "ModifiedOn"),
        LeadOwnerId: getValue(lead, "OwnerId"),
        LeadSource: getValue(lead, "Source")
    };
    return temp;
}

function getActivityOptions(leadId) {
    var activityOptions = {
        method: 'POST',
        uri: 'https://api.leadsquared.com/v2/ProspectActivity.svc/Retrieve?accessKey=u$re12bb28d38be37e77023027df17b9817&secretKey=59dce764514669ac1c1cec8f47bd5050d664158f&leadId=' + leadId,
        body: {
            "Paging": {
                "Offset": "0",
                "RowCount": "1000"
            }
        }
    }
    console.log(activityOptions);
    return activityOptions;
};

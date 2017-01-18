create database if not exists leadDB;
Create Table leadDB.Leads(
  LeadId nvarchar(100),
  FullName nvarchar(150),
  Email nvarchar(150),
  LeadType char(1),
  TuitionType nvarchar(100),
  LeadCreationDate datetime,
  LeadupdatedDate datetime,
  LeadOwnerId nvarchar(100),
  LeadSource nvarchar(150),
  PRIMARY KEY (LeadId)
);
GO
create Table leadDB.LeadOwner(
   LeadOwnerId nvarchar(100),
   FullName nvarchar(150),
   PRIMARY KEY (LeadOwnerId)
);
GO
Create Table leadDB.LeadActivities(
   LeadId nvarchar(100),
   ActivityId nvarchar(100),
   Date datetime,
   ActivityType int,
   PRIMARY KEY (LeadId)
);
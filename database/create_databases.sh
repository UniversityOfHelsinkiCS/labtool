#!/bin/sh
#users 
sequelize model:create --name Users --attributes username:string,email:string,firsts:string,lastname:string,token:string 

#course_instances
sequelize model:create --name Course_instances --attributes name:string,start:date,end:date,active:boolean,week_amount:integer,week_max_points:integer,current_week:integer

#course_instances_teachers_users
sequelize model:create --name Course_instances_teachers_users --attributes

#course_instances_students_users
sequelize model:create --name Course_instances_students_users --attributes

#week
sequelize model:create --name Week --attributes points:integer --attributes

#course
sequelize model:create --name Course --attributes name:string,label:string



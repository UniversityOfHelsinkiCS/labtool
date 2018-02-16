#!/bin/sh
#users 
sequelize model:create --name users --attributes username:string,email:string,firsts:string,lastname:string,token:string 

#course_instances
sequelize model:create --name course_instances --attributes name:string,start:date,end:date,active:boolean,week_amount:integer,week_max_points:integer,current_week:integer

#course_instances_teachers_users
sequelize model:create --name course_instances_teachers_users

#course_instances_students_users
sequelize model:create --name course_instances_students_users 

#week
sequelize model:create --name week --attributes points:integer

#course
sequelize model:create --name course --attributes name:string,label:string



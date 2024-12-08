@echo off
echo Executing SQL scripts...

REM Adjust the path to your MySQL installation if needed
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql"

REM Execute the SQL scripts
%MYSQL_PATH% -u root -p ProjetPfeAgil < migrations/add_test_station.sql
%MYSQL_PATH% -u root -p ProjetPfeAgil < migrations/add_test_gerant.sql

echo SQL scripts executed.
pause

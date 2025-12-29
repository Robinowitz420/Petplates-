@echo off
set JAVA_HOME=D:Javajdk-17
firebase emulators:start --only firestore --project=pet-plates

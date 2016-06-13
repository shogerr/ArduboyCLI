:: Created by ARDUBOY, please don't edit manually.
@ECHO OFF

SETLOCAL

SET "NODE_EXE=%~dp0\node.exe"
IF NOT EXIST "%NODE_EXE%" (
  SET "NODE_EXE=node"
)

SET "NPM_CLI_JS=%~dp0\node_modules\ARDUBOY\bin\arduboy-cli.js"
FOR /F "delims=" %%F IN ('CALL "%NODE_EXE%" "%ARDUBOY_CLI_JS%" prefix -g') DO (
  SET "ARDUBOY_PREFIX_ARDUBOY_CLI_JS=%%F\node_modules\arduboy\bin\arduboy-cli.js"
)
IF EXIST "%ARDUBOY_PREFIX_ARDUBOY_CLI_JS%" (
  SET "ARDUBOY_CLI_JS=%ARDUBOY_PREFIX_ARDUBOY_CLI_JS%"
)

"%NODE_EXE%" "%ARDUBOY_CLI_JS%" %*
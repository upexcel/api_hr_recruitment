# hr_system

[![Circle CI](https://circleci.com/gh/mtchavez/circleci.svg?style=svg)](https://circleci.com/gh/mtchavez/circleci)
## Install Dependencies
``` $ npm install ```
### need to do changes in live_config.json && dev_config.json

### For configure you own gmail account

#### step 1:- (create your own google account credentials)

##### go through the url : https://console.developers.google.com/apis/credentials

```
you get 
CLIENT_ID
CLIENT_SECRET
```

#### step 2:- getting access to upload file in google drive using own credentials

##### go through the url : https://developers.google.com/oauthplayground/

```
	1. go to the settings and select (Use your own OAuth credentials)
	2. then go to select & authorize APIs and select scope (https://www.googleapis.com/auth/drive.file) in Drive API v3
	3. then click on Exchange authorization code for tokens
	4. now we will get 
		"access_token"
		"token_type"
		"expires_in": true (need to change)
		"refresh_token"
```

#### step 3:- getting folder id 

```
	1. open google drive of you google account
	2. create a folder and the access to this folder in public
	3. then get sharable link 
	4. https://drive.google.com/open?id
	5. this id is put into folderid
``` 
#### for attachments to save in google drive keys to create in ecosystem.config.js file  
```
"CLIENT_ID":"",
"CLIENT_SECRET": "",
"REDIRECT_URL": "",
"access_token": "",
"token_type": "",
"expires_in": ,
"refresh_token": "",
"folderid": "",
"push_message_server_key": "",
"ACCOUNT_SID": "",
"AUTH_TOKEN": "",
"TRACKING_ID": "",
```

#### For automatic mail send need to update sendgrid information in config file
```
"SMTP_HOST": "",
"SMTP_PORT": ,
"SMTP_USER": "",
"SMTP_PASS": "",
"boolean":true,
"is_silent":true
```

## Setup for circleci 

### Write TestCases on postman
```
create test cases on postman for every api request
export the postman collection in your root directory with named postman.json
export the postman env data in root directory with named env.json
```

#### How to write postman test cases
```
for every api response should be validated by the next api request
Example:-
suppose we fire an api for creating user, then we need to ensure that the user is successfully created 
for this again we need to fire an api for ensuring that the user is successfully created
```

#### How to create env file
```
env file contains all data that we used during fire api request through postman
we create an env file so that we didn't use any hardcoded data for api request
env file contains all the varaibles that is used in verifing api response
```

### Create a folder for circleci with named .cicleci within folder a config.yml file

#### Required Docker Images
```
node (with required version)
mongo (with required version)
mysql (with require version and send proper enivironment like(MYSQL_ROOT_PASSWORD,MYSQL_ALLOW_EMPTY_PASSWORD,MYSQL_HOST))
```

#### Required Steps for testing test cases
```
- checkout
- run mkdir -p /home/ubuntu/hr-recruit
- run: npm install
- run: npm run db
- run: npm run build
- run: npm install pm2 -g 
- run: pm2 start npm --name recruit -- run dev
- run: npm install -g newman
- run: npm run test
```

#### Response for running test cases on circleci like
```
┌─────────────────────────┬──────────┬──────────┐
│                         │ executed │   failed │
├─────────────────────────┼──────────┼──────────┤
│              iterations │        1 │        0 │
├─────────────────────────┼──────────┼──────────┤
│                requests │      177 │        0 │
├─────────────────────────┼──────────┼──────────┤
│            test-scripts │      176 │        0 │
├─────────────────────────┼──────────┼──────────┤
│      prerequest-scripts │       15 │        0 │
├─────────────────────────┼──────────┼──────────┤
│              assertions │     1047 │        0 │
├─────────────────────────┴──────────┴──────────┤
│ total run duration: 22.6s                     │
├───────────────────────────────────────────────┤
│ total data received: 318.45KB (approx)        │
├───────────────────────────────────────────────┤
│ average response time: 89ms                   │
└───────────────────────────────────────────────┘
```

## To run on local use 

```$ npm start```

## to run on server use

``` npm run build```
``` pm2 start ecosystem.config.js --env live```
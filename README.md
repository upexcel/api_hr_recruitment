# hr_system


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
#### for attachments to save in google drive keys to update in config.json file  
```
"CLIENT_ID":"",
"CLIENT_SECRET": "",
"REDIRECT_URL": "",
"access_token": "",
"token_type": "",
"expires_in": ,
"refresh_token": "",
"folderid": ""
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

## To run on local use 

```$ npm start```

## to run on server use

``` $ pm2 start npm --name hr_recruitment_live -- start```

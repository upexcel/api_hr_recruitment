# hr_system


## Install Dependencies
``` $ npm install ```
### need to do changes in live_config.json && dev_config.json

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

```$ npm run dev```

## before run on server needs

```$ npm run build```
 
```$ npm start```
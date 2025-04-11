# JIRA / Bitbucket Data Center Webex Bot

Host a lightweight node script to forward JIRA and Bitbucket (Data Center) Webhooks to Webex with a bot token.

## Demo
[![Vidcast Overview](https://github.com/user-attachments/assets/6ef4337f-510e-4a22-aed8-ad21e85df614)](https://app.vidcast.io/share/61892bbf-046c-49a9-8698-8b37972a1bf3)


## Getting Started

- Clone this repository:
  - ```git clone https://github.com/wxsd-sales/jira-bitbucket-forwarder.git```

- [Create a Webex Bot Token](https://developer.webex.com/docs/bots)
- Developed with node v23.8

## Installation

### 1. Setting up the .env file
- a. In a text editor, open the file in this project's root folder ```example.env```
- b. Choose a ```PORT``` or use ```PORT=5000``` if you are not sure what to use.
- c. Paste your JIRA Data Center url between the double quotes of ```JIRA_SERVER=""```
- d. Paste your Webex Bot Token from the *Getting Started* section between the quotes for ```WEBEX_BOT_TOKEN```.
- e. Rename the file ```.env.example``` to ```.env```

### 2.a. Running the webserver as a container (Docker) (recommended)

- If you prefer to run this through ```npm```, skip this step and proceed to 2.b.
- Otherwise, run the following commands from the terminal inside your project's root directory:
- `docker build -t jira-bitbucket-forwarder .`
- `docker run -p 5000:5000 -i -t jira-bitbucket-forwarder`
  - replace `5000` in both places with the ```PORT``` used in your `.env` file.  

### 2.b. Running the widget webserver (npm)
_Node.js version 23.8 was used in the development of this application._

- It is recommended that you run this as a container (step 2.a.).
- If you do not wish to run the webserver as a container (Docker), proceed with this step:
- Inside this project on your terminal type: `npm install`
- Then inside this project on your terminal type: `npm start`
- This should run the app on your ```PORT``` (from .env file)


### 4. Wire Up the Widget to the Layout:

- You must replace the url on line 108 of the **_callControlWidget.json_** file with your correct server endpoint. For examples:
  - "script": "http://localhost:5000/build/bundle.js",
  - "script": "https://your.webserver.com/build/bundle.js",
- This should be based on the ```HOST_URI``` in your .env file + ```/build/bundle.js```.
  
- Upload the **_callControlWidget.json_** file onto your Administration Portal **[WebexCC Portal - US](https://portal.wxcc-us1.cisco.com/portal/home.html#)**
  - _link above is referencing the US portal link please change if you are in different geo (us1, eu1, eu2, anz1)_
  - Note that Layouts are configured per Agent Team.
- Log in to your agent and select the right Team to view the new layout.

**Additional Improvements:**

- You can modify the widget as required.
- To create a new compiled JS file, using `npm run build` which will create the new compiled JS under `build/bundle.js`.
- You may rename this file, host it on your server of choice, and use this as the widget `src` parameter in the layout.

## License

All contents are licensed under the MIT license. Please see [license](LICENSE) for details.

## Disclaimer

<!-- Keep the following here -->  
Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex usecases, but are not Official Cisco Webex Branded demos.
 
 
## Support

Please contact the Webex SD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=CCMeetingTransferWidget) for questions. Or for Cisco internal, reach out to us on Webex App via our bot globalexpert@webex.bot & choose "Engagement Type: API/SDK Proof of Concept Integration Development". 

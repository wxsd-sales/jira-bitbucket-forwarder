import express from "express";
import 'dotenv/config';
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 5000;
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.WEBEX_BOT_TOKEN}`
};

app.use(express.json());

function capitalizeWords(str) {
  return str.toLowerCase().split(' ').map(word => {
    if(word.toLowerCase() === "pr"){
      return word.toUpperCase();
    } else {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  }).join(' ');
}

function formatUser(user){
  return `${user.displayName} (${user.emailAddress})`;
}

function jiraMessage(body){
  try{
    let message = body.webhookEvent.replaceAll(":", " ").replaceAll("_"," ");
    message = capitalizeWords(message);
    //console.log(message);
    let event;
    let prettyEvent = "Updated";
    if(body.issue_event_type_name){
      event = body.issue_event_type_name.replace("issue_","");
      if(event !== "generic"){
        prettyEvent = capitalizeWords(event.replaceAll("_", " "));
      }
      if(body.webhookEvent.indexOf(event) < 0){
        message += ` (${prettyEvent})`
      }
    }
    let updaterListed = false;
    if(body.issue){
      message += `, Key: <a href="${process.env.JIRA_SERVER}/browse/${body.issue.key}">${body.issue.key}</a>`
      if(body.issue.fields){
        message += `, Summary: **${body.issue.fields.summary}**`;
        message += `, Type: ${body.issue.fields.issuetype.name}`;
        //console.log(body.issue.fields.status);
        if(body.user && event !== "commented"){
          message += `, ${prettyEvent} By: ${formatUser(body.user)}`;
          updaterListed = true;
        }
        if(body?.changelog?.items){
          for(let i of body.changelog.items){
            console.log('changelog item:', i);
            let toString = i.toString;
            if(!toString){
              toString = "Undefined";
            }
            message += `, Changed **${capitalizeWords(i.field)}**`;
            if(["description"].indexOf(i.field.toLowerCase()) < 0){
              message += ` To: ${toString}`;
            }
          }
        }
      }
    }
    if(body.comment){
      if(!updaterListed){
       message += `, Author: ${formatUser(body.comment.author)}`;
      } else {
        message += `, Added Comment`
      }
    //   message += `  \nComment: <code>${body.comment.body}</code>`;
    }
    return message
  }catch(e){
    console.error("jiraMessage Error:");
    console.error(e);
  }
}

function bitbucketMessage(body){
  try{
    let message = body.eventKey.replaceAll(":", " ").replaceAll("_"," ");
    message = capitalizeWords(message);
    if(body.repository){
      if(body.repository?.links?.self){
        let link = body.repository.links.self[0].href;
        message += `, Repository: <a href="${link}">${body.repository.name}</a>`;
      }
      if(body.repository?.origin?.links?.self){
        let originLink = body.repository.origin.links.self[0].href;
        message += `, Origin: <a href="${originLink}">${body.repository.origin.name}</a>`;
      }
    }
    message += `, Actor: ${formatUser(body.actor)}`;
    if(body.changes){
      for(let c of body.changes){
        console.log('change.ref:');
        console.log(c.ref);
        message += `, ${c.type} ${c.ref.type} ${c.ref.displayId}`;
      }
    }
    if(body.toCommit){
      message += `, Commit Message: ${body.toCommit.message}`;
    }
    if(body.pullRequest){
      if(body.pullRequest?.links?.self){
        let prLink = body.pullRequest.links.self[0].href;
        message += `, PR: <a href="${prLink}">${body.pullRequest.title}</a>`;
      } else {
        message += `, PR: ${body.pullRequest.title}`;
      }
      message += `, State: ${body.pullRequest.state}`;
    }
    return message
  }catch(e){
    console.error("bitbucketMessage Error:");
    console.error(e);
  }
}

app.post(`/:roomId`, async (req, res) =>{
  try{
    let result = {success:false};
    console.log('POST /{roomId}', req.params.roomId);
    console.log(req.body);
    let message;
    if(req.body.webhookEvent){//JIRA Events
      message = jiraMessage(req.body);
    } else if(req.body.eventKey){//BitBucket Events
      message = bitbucketMessage(req.body);
    }else {
      result.message = "missing request body attribute 'webhookEvent' or 'eventKey'";
      res.statusCode = 400;
    }
    if(message){
      let payload = {
        roomId: req.params.roomId,
        markdown: message
      }
      let resp = await fetch('https://webexapis.com/v1/messages',{
        method: "POST",
        headers:headers,
        body: JSON.stringify(payload)
      });
      let json = await resp.json();
      console.log('/messages response code:', resp.status);
      console.log('/messages response json:', json);
      if(resp.status > 299){
        result.message = `Webex Message Error: ${json.message}`;
        res.statusCode = resp.status;
      } else {
        result.success = true;
      }
    }
    res.setHeader('Content-Type',"application/json");
    res.send(JSON.stringify(result));
  }catch(e){
    console.error("POST /:roomId Error:");
    console.error(e);
  }
})


app.listen(port, async () => {
  console.log(`listening on ${port}`);
});

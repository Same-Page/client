# Same Page

Same page (previously called Chat Anywhere) can add social activities including url based live chat, comment etc. to your website by including just a few lines of code! You can also run your own backend or do all sorts of customization if you want.

## Project structure

Both frontend and backend are included in this repository.

### Client Folder

The client folder includes the chat box and an injection script, both of them are built with create-react-app. The way it works is that once you include the injection script to your website, the script can create an iframe with chat box. This design has two major benefits:

1. The chat box's file size is quite big because it includes so many features, therefore you probably don't want to load it on every page load. It makes a lot more sense to load the chat box iframe only when user wants to use it.
2. Iframe provides great isolation of the chat box and your website, no need to worry about CSS or Javascript pollution.

The injection script itself is rather small, it's able to

1. Add a button that creates the iframe with chat box.
2. Connect to chat socket server and show how many users are on the same page or site.
3. Show Danmu (scrolling text) for live messages.

We include the 2nd and the 3rd functionality to the injection script rather than the chat box because they are very useful.

### Server Folder

The server folder contains a Python based API folder and a Nodejs based chat-socket folder. The live chat functionality is powered by socket.io, a nodejs library, while most other functionalities like updating profile, leaving comment, sending direct mail etc, are all written in Python and put into the API folder.

## How to develop and run locally

### Run the client locally

Remeber that the client contains two pieces, so there are two steps to run client locally.
First, run the chat box app

```
cd client/chatbox
npm install .
npm start
```

The first time you run this will be slower, because it needs to install all the packages needed. The chat box will be running on localhost:3000, but the chat box is not designed to be used by itself, instead, it must be used in an iframe. So the next thing you need to do is to run the injection script app.

```
cd client/injection-script
npm install .
npm start
```

Now you should see the client running on localhost:3210, the chatbox should also show up there.

The client is talking to the official backend by default. If you want the client to talk to your local backend, it's very easy. Instead of `npm start`, type `npm start:dev`. Then it will be talking to your localhost:8080 for websocket connections for live chat feature and localhost:8081 for ajax calls for all other purposes. So you need to have those running. Please read the next section to learn how to run backend locally.

### Run websocket server locally for live chat

```
cd server/chat-socket
npm install .
node index.js
```

### Run API backend locally

```
cd server/api
(Highly recommend that you create a Python virtual env first)
pip install -r requirements.txt
python run.py
```

## How to deploy frontend

### Build

Like mentioned before, the client has two parts - chat box and injection script. They need to be built separately.
To build the chat box.

```
cd client/chatbox
npm run build
```

To build the injection script.

```
cd client/injection-scirpt
npm run build
```

The final build is placed in the `/build` folder.

### Deploy

To use your own version of injection script, upload your `client/injection-scirpt/build/content-static` folder to your server so it's reachable as `your-website.com/build/content-static`. Then include the scripts by adding following lines to your website.

```
<link href="https://your-website.com/build/content-static/css/main.css" rel="stylesheet">
<script src="https://your-website.com/build/content-static/js/main.js" ></script>
```

To use your own version of chat box, upload your `client/chatbox/build/content-static` folder to your server so it's reachable as `your-website.com/build/static`. You need to modify the injection script, specifically the iframe src to point to your own chat box.

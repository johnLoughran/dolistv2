// To Do List v2 using MongoDB, and Atlas Cloud
// modified to add iwsDirPath = "/apps/dolistv2/" to root dir
// doing $ npm install with json present installs express, b-p, ejs
// ( all dependencies mentioned in json) // also do $ npm i mongoose after that

// $ mongo "mongodb+srv://cluster0.97bh1.mongodb.net/<dbname>" --username johnLoughran
// <dbname> is dolistv2DB, pwd is joxF3h6ovuBcvmYp

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const myDateModule = require(__dirname + "/myDateModule.js")
//const ejs = require("ejs");

const app = express();
app.use(bodyParser.urlencoded ({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// completes the path from /home/skerries to the app dir on irish web server hosting
const iwsDirPath = "/apps/dolistv2/"; // on iws server
// can test locally at localhost:3000/apps/dolistv2/ or same/work in browser
// const iwsDirPath = "/"; // for local development

const workTitle = "Work To Do List";

// connect to db server and the db named..
const dbName = "todolistDB";  // local DB
// mongoose.connect("mongodb://localhost:27017/" + dbName, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb+srv://johnLoughran:joxF3h6ovuBcvmYp@cluster0.97bh1.mongodb.net/dolistDBv2", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {
  name: {
    type: String,
    required: true
  }
};

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Get up"
});

const item2 = new Item ({
  name: "Get dressed"
});

const item3 = new Item ({
  name: "Eat porridge"
});

const defaultItems = [item1, item2, item3];

const doListSchema = {
  doListName: String,
  doList: [itemsSchema]
}

const DoList = new mongoose.model("DoList", doListSchema);

app.get(iwsDirPath, function(req, res) {
  console.log("Serving / root route");
  Item.find({}, function(err, foundItems){
    if (err){
      console.log(err);
    } else {
      if (foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log(err);
          } else {
            console.log("Added default items to Items[]");
            console.log(foundItems); // not added until after this fn ends
            res.redirect(iwsDirPath); // so it loops to else if items array is not empty, render the page
          }
        });
      } else {
        console.log(foundItems);
        //const thisDayDate = myDateModule.getDate(); // simplified to
        const thisDayDate = "Today";
        res.render("list", {listTitle: thisDayDate, newListItems: foundItems, IWSDirPath: iwsDirPath});
      } // end if foundItems is empty or not
    } // end if error searching in the db
  }); // end findItems call
}); // end app get

app.post(iwsDirPath, function(req, res){
  console.log("Posting, root");
  console.log(req.body.listName);

  const listName = _.startCase(_.lowerCase(req.body.listName));
  const itemName = _.startCase(_.lowerCase(req.body.newItem));
  const anItem = new Item ({
    name: itemName
  });

  if (listName === "Today"){
    anItem.save(); // adds one item to current collection
    res.redirect(iwsDirPath);
  } else {
    DoList.findOne({doListName: listName}, function(err, foundList){
      foundList.doList.push(anItem);
      foundList.save(); // updates list collection to include latest item

      res.redirect(iwsDirPath + listName);
    });
  }
});

app.get(iwsDirPath + ":customListName", function(req, res){
  const customListName = _.startCase(_.lowerCase(req.params.customListName));
  console.log("Serving custom route using route parameter: " + customListName);

  DoList.findOne({doListName: customListName}, function(err, theDoList){
    if (err){
      console.log(err);
    } else {
      if (!theDoList) {
        const aDoList = new DoList({
          doListName: customListName,
          doList: defaultItems
        });
        aDoList.save();

        res.redirect(iwsDirPath + customListName);
      }
      else {
        res.render("list", {listTitle: theDoList.doListName, newListItems: theDoList.doList, IWSDirPath: iwsDirPath });
        //res.render("/", {listTitle: customListName, newListItems: theDoList.doList });
      }
    }
  });
}); // end app get

app.post(iwsDirPath + "delete", function(req, res){
  console.log(req.body.checkbox);
  console.log(req.body.theListName);
  const checkedItemId = req.body.checkbox;
  const theListName = req.body.theListName;

  if (theListName === "Today"){
    Item.findByIdAndRemove(checkedItemId, {useFindAndModify: false}, function(err){
      if(err){
        console.log(err);
      } else {
        console.log("Found and removed item");
        res.redirect(iwsDirPath);
      }
    });
  } else {
    // finds one DoList with name=param (condition), then (update) using mongodb
    // $pull operator, to remove - see mongdb docs - the item that has an id of checkbox then (callback)
    DoList.findOneAndUpdate({doListName: theListName}, {$pull: {doList: {_id: checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect(iwsDirPath + theListName);
      }
    });
  }

});

app.get(iwsDirPath + "work", function(req, res){
  console.log("Serving /work route");
  res.render("list", {listTitle: workTitle, newListItems: workItems, IWSDirPath: iwsDirPath});

})

app.get(iwsDirPath + "about", function(req, res){
  console.log("Serving /about route");
  res.render("about");
})

// var port = process.env.PORT;
// if (port == "null" || port == ""){
//   port = 3000;
// }
app.listen(process.env.PORT || 3000, function(req, res){
  console.log("Server started remotely or on port 3000");
})


// *********************************************************
// const items = ["Buy food", "Cook food", "Eat food"];
// const workItems = [];

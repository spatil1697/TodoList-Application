//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("loadash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add an item."
});

const item3 = new Item({
  name: "<--Hit this to delete an item."
});


const defultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successful");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  })



});

app.post("/", function(req, res) {

  const intemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName ==="Today"){
    item.save();
  res.redirect("/");
}else{
  List.findone({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" +listName)
  })
}
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName= req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Deleted Succefully");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}} , function(err,foundList){
      if(!err){
        res.redirect("/" +listName);
      }
    });
  }




});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName) ;

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new List
        const list = new List({
          name: customListName,
          items: defultItems,
        })
          list.save();
          res.redirect("/"+customListName);
      }else{
      res.render("List",{listTitle: foundList.name, newListItems:foundList.item});
      }
    }
  })


});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server started on port 3000");
});

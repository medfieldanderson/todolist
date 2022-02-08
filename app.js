//jshint esversion:8

const express = require("express");
const bodyParser = require("body-parser");
// const hDate = require(__dirname + "/helpers/date.js");
// const hMenu = require(`${__dirname}/public/helpers/menu.js`);
const hString = require(`${__dirname}/public/helpers/string.js`);
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const PORT = 3000;

const pwd = process.env.MONGODB_PASSWORD;

// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
mongoose.connect(`mongodb+srv://admin-jeff:${pwd}@cluster0.uyyzc.mongodb.net/todolistDB`, {
  useNewUrlParser: true
});

// Create a SCHEMA
const itemsSchema = {
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: "General",
  }
};

// Create a MODEL (singular; Capitalized "Item")
const Item = mongoose.model("Item", itemsSchema);

// Create a SCHEMA
const listSchema = {
  name: {
    type: String,
    required: true
  },
  items: [itemsSchema]
};

// CREATE MODEL - "List"
const List = mongoose.model("List", listSchema);

const getDefaultItems = () => {
  const defaultItems = [
    {
      name: "Be kind to yourself",
      category: "Self help"
    },
    {
      name: "Lunch walk",
      category: "Exercise"
    },
    {
      name: "Ride the bike",
      category: "Exercise"
    }
  ];
  return defaultItems;
};

// ASYNC FUNCTIONS
const createDefaultItems = async () => {
  console.log(`createDefaultItems`);
  const defaultItems = getDefaultItems();
  try {
    await Item.insertMany(defaultItems);
    console.log("Data inserted");
  } catch (error) {
    console.log(error);
  }
};


// ROUTES
app.get("/Json", (req, res) => {
// WHAT IS HAPPENING HERE?  This started when I tried to debug node.js using
// about:inspect or chrome://inspect
});
app.get("/favicon.ico", (req, res) => {
  // console.log(`FUCKING FAVICON!!!`);
  // FUCKING HELL...  Took me 2 hours to figure out that express was sending favicon.ico to my default address
  return `${__dirname}/public/favicon.ico`;
});
app.get("/about", (req, res) => {
  res.render("about");
});

// DEFAULT ROUTE
app.get("/", async (req, res) => {

  try {
    // returns an array of mongodb collections named "items"
    // if 0, no items collection exists
    const itemsCollection = await mongoose.connection.db.listCollections(
    {
      name: 'items'
    })
    .toArray();

    // get all Lists for menu -ASYNC
    const allLists = await List.find().exec();

    // Items collection are tied to the "DEFAULT" todolist (not associated with a List)
    //  Check for existence of Item collection -ASYNC
    const existingItems = await Item.find().exec();
    if(itemsCollection.length === 1) {
      res.render("list", {
          // menuItems: hMenu.menuItems,
          menuItems: allLists,
          listTitle: "Today",
          newListItems: existingItems || []
        });
    } else {
      // ELSE create default list items -ASYNC
      await createDefaultItems();
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/:customListName", async (req, res) => {

  const customListName = hString.capitalize(req.params.customListName);

  try{

    // get the menuItems
    const allLists = await List.find().exec();

    const found = await List.findOne({name: customListName});
    if (found) {
      res.render("list", {
        // menuItems: hMenu.menuItems,
        menuItems: allLists,
        listTitle: found.name,
        newListItems: found.items
      });

    }
    else {
      const list = new List({
        name: customListName,
        items: getDefaultItems()
      });
      list.save();
      res.redirect(`/${customListName}`);

    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/", (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    // THE DEFAULT "/" list
    item.save();
    res.redirect("/");
  } else {
    // Named list
    List.findOne({
        "name": listName
      }).exec()
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect(`/${listName}`);
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

app.post("/delete", (req, res) => {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    // DEFAULT LIST
    Item.findByIdAndRemove(checkedItemId)
      .then((response) => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOneAndUpdate({
        name: listName
      },
      // https://docs.mongodb.com/manual/reference/operator/update/pull/
      {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      }, (err, foundList) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`FOUNDLIST:    ${foundList}`);
          res.redirect(`/${listName}`);
        }
      }
    );
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

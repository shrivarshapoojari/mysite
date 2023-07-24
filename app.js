//jshint esversion:6

const express = require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const app = express();
const _=require("lodash");
app.set('view engine', 'ejs');
app.use(express.static("public"));//used to acess css
app.use(bodyParser.urlencoded({extended: true}));
 
mongoose.connect('mongodb+srv://shrivarshapoojary8095:Shri8722@cluster0.c6bmblx.mongodb.net/todoListDB').then(() => {
    console.log(`successfully connected`);
  }).catch((e) => {
    console.log(`not connected`);
  }); 




  const itemschema=new mongoose.Schema({
    name:String
  });

  const Item=mongoose.model("Item",itemschema);
  
 const item1 =new Item({
  name:"Welcome to your todo list"
 });

 const item2=new Item({
  name:"press + button to add new"
 });

 const item3 =new Item({
  name:"press <-- button to delete"
 });
 
 const defaultItems=[item1,item2,item3];



 const listSchema={
  name:String,
  items:[itemschema]
 }
 const List=mongoose.model("List",listSchema);
 




// display all elements inside ITEM
app.get("/",function(req,res){
  Item.find().then((founditem)=>
  { 
    if(founditem.length==0)
    {
      Item.insertMany([item1,item2,item3]).then(()=>{
        console.log("Inserted");
       }).catch((e)=>{
        console.log(e);
       });
       res.redirect("/");
    }
    else
    {
       res.render("list", {listTitle:"Today", newListItems: founditem});
    }
  })
})


app.get("/:customListName",function(req,res){
 const customListName=_.capitalize(req.params.customListName);
 List.findOne({name:customListName}).exec().then((found)=>
 {
  if(found)
  {
    console.log("exist");
    res.render("list", {listTitle:found.name, newListItems:found.items});


  }
  else
  {
    console.log("not exist");
    const list=new List({
      name:customListName,
      items:defaultItems
    
     });
     
     list.save();
     res.redirect("/"+customListName)

  }
 });
  
 
  

 

})


 

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listname=="Today")
  {
    
  item.save();
   
  res.redirect("/");

  }
  else{
    List.findOne({name:listname}).exec().then((foundList)=>
    {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listname);
    })
  }


});
   
app.post("/delete", function(req, res) {
  const checked = req.body.check.trim(); // Remove leading/trailing spaces
   
const listName=req.body.listName;
if(listName==="Today")
{
  Item.findByIdAndRemove(checked).then(() => {
    console.log("dt");
  });
  res.redirect("/");
}
else{
 List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checked}}}).then(()=>{
  console.log("DEleted from custom listt");
  res.redirect("/"+listName);
 })
}
});


 

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

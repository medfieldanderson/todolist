//jshint esversion:6
module.exports.menuItems = [];

module.exports.refreshMenu = (listModel) => {

  // RESET MENU ITEMS
  this.menuItems = [];

  // listModel.find({},{_id:0, name: 1}, (err, res) => {
  //   if(err) {
  //     console.log(error);
  //   } else {
  //     res.forEach((list) => this.menuItems.push(list));
  //   }
  // });

  listModel.find({}, {_id:0, name: 1})
  .then((all) => {
    all.forEach((list) => this.menuItems.push(list));
    console.log(`HMENU MENUITEMS ARRAY: ${this.menuItems}`);
  })
  .catch((error) => {
    console.log(error);
    return [];
  });

  return this.menuItems;
};

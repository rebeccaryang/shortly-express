var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  //hasTimestamps: true,
  defaults: {
    username: "demo",
    password: "demo"
  },

  checkPassword: function(password){
    // bcrypt.compare(password, this.get('password'), function(err, match){
      if (password === this.get('password')) {
        return true;
      } else {
        return false;
      }
    // })
  },
  // clicks: function() {
  //   return this.hasMany(Click);
  // },
  initialize: function(){
    this.on('creating', function(model, attrs, options){
      var myPass = model.get('password');
      bcrypt.hash(myPass, null, null, function(err, hash){
        model.set('password', hash);
      })

    })







    // var that = this;
    // bcrypt.hash(this.get('password'),null,null,function(err,hash){
    //   if (err){
    //     console.log(err)
    //   } else {
    //     //that.set('password',hash)
    //      that.on('creating', function(model, attrs, options){
    //       model.get('password');
    //       model.set('password', hash);
    // });
    //     // that.save('password',hash)
    //     // console.log(that.get('password'))
    //   }
    // })

   
 }  
});

module.exports = User;
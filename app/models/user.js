var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  //hasTimestamps: true,
  defaults: {
    username: "demo",
    password: "demo",
    salt: "salt"
  },

  checkPassword: function(password){
    var bcryptAsync = Promise.promisify(bcrypt.compare);
    return bcryptAsync(password, this.get('password')).then(function(match){
      return match;
    })
  },
  // clicks: function() {
  //   return this.hasMany(Click);
  // },
  initialize: function(){
    // this.on('creating', function(model, attrs, options){
      var myPass = this.get('password');
      // var hashVal = bcrypt.hash(myPass, 10);
      // console.log("Hash:" + hashVal);
      // this.set('password', hashVal);
      var salt = bcrypt.genSaltSync(10);
      this.set('salt', salt);
      var hash = bcrypt.hashSync(myPass, salt);
      this.set('password', hash);
      //   null, null, function(err, hash){
      //   model.set('password', hash);
      // })

    // })







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
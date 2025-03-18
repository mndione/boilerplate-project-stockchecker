'use strict';

module.exports = function (app) {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI); 
  const Stock = mongoose.model('Stock', new mongoose.Schema({
    prod: String,
    ip: String
  }));
  const bcrypt = require('bcrypt');
  
  app.route('/api/stock-prices')
    .get(async function (req, res){
      let stock = req.query.stock;
      if(!Array.isArray(stock)) stock = [stock];
      
      const like = req.query.like=='true' ? 1 : 0;
      let returnStock = [];
      
      for(let i=0; i<stock.length; i++ ) {
        let s = stock[i];
        
        if(like){
          const hashIp = await bcrypt.hash(req.ip, process.env.SALT);
          let stockL = await Stock.findOne({prod: s, ip: hashIp});
          if(!stockL){
            stockL = new Stock({prod: s, ip: hashIp});
            stockL.save();

          }
          
        }
        
        let priceInfo = await fetch('https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'+ s +'/quote')
        priceInfo = await priceInfo.json();

        let likes = await Stock.aggregate([
          { $match: { prod: s } },
          { $count: "slike" }
        ]);
        let sLike = 0;
        if (likes.length) {
          likes = likes[0];
          sLike = likes.slike;
        }
               
        let sOut;
        
        if(priceInfo){
          sOut = {stock: priceInfo.symbol, price: priceInfo.latestPrice, likes: sLike}; 
        }
        else {
          sOut = {likes: sLike};
        }
        returnStock.push(sOut);
        
       }
       //console.log(returnStock);
      if(returnStock.length==1) {
        returnStock = returnStock[0];
      }
      else{
        returnStock[0].rel_likes = returnStock[0].likes - returnStock[1].likes;
        delete returnStock[0].likes;
        delete returnStock[1].likes;
        returnStock[1].rel_likes = - returnStock[0].rel_likes;
      }
      res.json({stockData: returnStock});
    });
    
};

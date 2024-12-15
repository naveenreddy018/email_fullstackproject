function Otp(){

    let otp = Math.floor(Math.random()*9000)+1000;
      
    return otp;


}

Otp();


module.exports = Otp;




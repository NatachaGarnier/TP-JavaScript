function adder(l,r){
	return function(v){

		return l(v) + r(v);
	}	

}

function mult(v){
	return function(e)
	{
		return v*e;
	}
}


//Fuction sub 

function sub(l){
	return function(v){

		return l - v;
	}	
}


//Fonction adder qui accepte un nombre variable d'argument
function adder(){
	var tab = Array.prototype.slice.call(arguments);
	var res = 0;
  	return function(v){
		tab.forEach(function(fun){				
			res = res + fun(v);
		});			
		console.log(res);
		
	};
}



adder()(0); // 0
adder()(1); // 0
adder(mult(2))(1); // 2
adder(mult(2), mult(2))(1); // 4
adder(mult(2), mult(2), mult(2))(1); // 6
adder(mult(2), sub(2), mult(2))(1); // 5


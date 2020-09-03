//Nome de classe inicia em maiúscula
//qualquer método desta classe consegue acessar seus atributos
class User{

    constructor(id, name, gender, birth, country, email, password, photo, admin){

        //quando há _ subentendesse que são propriedades privadas, não é uma regra: é convenção
        this._id = id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();


    }  

    get id(){
        return this._id;
    }
    get name(){
        return this._name;
    }
    get gender(){
        return this._gender;
    }
    get birth(){
        return this._birth;
    }
    get country(){
        return this._country;
    }
    get email(){
        return this._email;
    }
    get password(){
        return this._password;
    }
    get photo(){
        return this._photo;
    }
    get admin(){
        return this._admin;
    }
    get register(){
        return this._register;
    }

    //deve ser passado um parametro para retornar o valor
    set photo(value){
         this._photo = value;
    }

    loadFromJson(json){

        for(let name in json){

            switch(name){
                case '_register':
                    this[name] = new Date (json[name]);
                break;
                default:    
                    this[name] = json[name];
            }
            
        }
    }

    static getUsersStorage(){

        let users = [];// ou new Array()

        if(localStorage.getItem("users")){
            
            users = JSON.parse(localStorage.getItem("users"));
        }

        return users;

    }

    getNewId(){

        //criar um novo id caso não exista
        if (!window.id) window.id = 0;
        id++;

        return this.id;
    }

    save(){

            let users = User.getUsersStorage();
 
            if(this.id > 0){

                //localizar exatamente o mesmo registro
                //let user = users.filter(u =>{return u._id === this.id});

                //mapeia a informação encontrada e já muda
                users.map(u =>{

                    if(u._id == this.id){
                    
                        //mesclar dois objetos
                        Object.assign(u, this);
                    }

                    return u;
                });
                

                let newUser = Object.assign({},user, this);



            }else{

                this._id =this.getNewId();

                users.push(this);
    
                
            }

            //sessionStorage.setItem("users",JSON.stringify(users));
            localStorage.setItem("users",JSON.stringify(users));
            
    }
}
class UserController{

    constructor(formIdCreate,formIdUpdate, tableId){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();

    }

    onEdit(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click",e=>{

            this.showPanelCreate();

        });

        this.formUpdateEl.addEventListener("submit", event=>{

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formUpdateEl).then((content)=>{

                if(!values.photo){
                    result._photo = userOld._photo;
                }else{
                    result._photo = content;
                }

            let user = new User();

            user.loadFromJson(result);

            user.save();
          
            this.getTr(user, tr);

            this.updateCount();

            //resetar o formulário
            this.formUpdateEl.reset();

            btn.disabled = false;

            this.showPanelCreate();

            },(e)=>{

                console.error();

            });

        });

        
    }

    onSubmit(){

        //O comando this sempre irá respeitar o escopo onde está atuando
        //let _this = this;
       
        //arrow function para evitar conflito de escopo
        //quando houver somente 1 parâmetro, não é necessário utilizar parenteses
        this.formEl.addEventListener("submit", event =>{
            //cancelar o comportamento padrão do evento
            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formEl);

            if(!values) return false;

            this.getPhoto(this.formEl).then((content)=>{

                values.photo = content;

                //this.insert(values);

                values.save();

                this.addLine(values);

                //resetar o formulário
                this.formEl.reset();

                btn.disabled = false;

            },(e)=>{

                console.error();

            });
            
        });

    }

    getPhoto(formEl){

        return new Promise((resolve, reject)=>{

            let fileReader = new FileReader();

        let elements = [...formEl.elements].filter(item=>{
             if(item.name ==='photo'){
                return item;
            }
        });

        let file = elements[0].files[0];

        fileReader.onload =()=>{

            resolve(fileReader.result);
        };

        fileReader.onerror=(e)=>{

            reject(e);
        };

        if(file){

            fileReader.readAsDataURL(file);
        } else{

            resolve('dist/img/boxed-bg.jpg');
        }

        });

    }

    getValues(formEl){

        //variável local usa-se let
        let user ={};
        let isValid = true;

        //[] referem-se a arrays
        //... spread = não especifica quantos itens eu possuo no array
        [...formEl.elements].forEach(function(field, index){

            if(['name','email','password'].indexOf(field.name) > -1 &&  !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            if(field.name == "gender"){

                if(field.checked){
                    user[field.name] = field.value;
                }
            }else if(field.name=="admin"){
                user[field.name] = field.checked;

            }else{
                user[field.name] = field.value;
            }

        });

        if(!isValid){
            return false;
        }

        return new User(
            user.id,user.name, user.gender, user.birth, user.country,
            user.email, user.password, user.photo, user.admin);
    }

    /*    getUsersStorage(){

        let users = [];// ou new Array()

        if(localStorage.getItem("users")){
            
            users = JSON.parse(localStorage.getItem("users"));
        }

        return users;

    }*/

    selectAll(){

        let users = this.getUsersStorage();

        users.forEach(dataUser=>{

            let user = new User();

            user.loadFromJSON(dataUser);
            
            this.addLine(user);
        });
        
    }

    /*insert(data){

        let users = this.getUsersStorage();

        users.push(data);

        //sessionStorage.setItem("users",JSON.stringify(users));
        localStorage.setItem("users",JSON.stringify(users));
    }*/

    addLine(dataUser){

        let tr = this.getTr(dataUser);

        //let tr = document.createElement('tr');   

         //adicionar ao final                   
         this.tableEl.appendChild(tr);      
         
         this.updateCount();
        
    }

    getTr(dataUser, tr = null){

        if (tr === null) {document.createElement('tr')};

        tr.dataset.user = JSON.stringify(dataUser);
                
        //Template String/*/
        tr.innerHTML = `
                            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                            <td>${dataUser.name}</td>
                            <td>${dataUser.email}</td>
                            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
                            <td>${Util.dateFormat(dataUser.register)}</td>
                            <td>
                                <button type="button" class="btn btn-primary btn-xs btn-edit btn-flat">Editar</button>
                                <button type="button" class="btn btn-danger btn-xs btn-delete btn-flat">Excluir</button>
                            </td>`;

                    this.addEventsTr(tr);                            

        return tr;
    }

    addEventsTr(tr){

        tr.querySelector(".btn-delete").addEventListener("click", e=>{

            if(confirm("Deseja realmente excluir?")){


                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove();

                tr.remove();
                
                this.updateCount();
            }
        });

        tr.querySelector(".btn-edit").addEventListener("click", e=>{

            let json = JSON.parse(tr.dataset.user);
            let form = document.querySelector("#form-user-update");

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            //para cada linha que passar, substituirá neste campo
            for( let name in json){

                let field = this.formUpdateEl.querySelector("[name="+name.replace("_"," ")+"]");

                if(field){

                    switch(field.type){

                        case 'file':
                            continue;
                        break;

                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_"," ") + "][value=" + json[name] + "]");   
                            //field.checked = true;
                        break;

                        case 'checkbox':
                            field.checked = json[name];
                        break;

                        default:
                            field.value = json[name];
                                            
                    }
                } 
            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;
            
            this.showPanelUpdate();
            
        });                  
    }

    showPanelCreate(){

            document.querySelector("#box-user-create").style.display ="block";
            document.querySelector("#box-user-update").style.display ="none";
    }

    showPanelUpdate(){

            document.querySelector("#box-user-create").style.display ="none";
            document.querySelector("#box-user-update").style.display ="block";
    }


    //calcular o total do que existir
    updateCount(){

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr=>{

            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if(user._admin) numberAdmin++;

        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
    }
      

}
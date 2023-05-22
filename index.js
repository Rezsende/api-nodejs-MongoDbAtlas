const express = require('express');
const bcrypt = require('bcrypt');
const connectToDb = require('./database/db');
const app = express()
const jwt = require('jsonwebtoken')

connectToDb();



app.use(express.json())

const User = require('./models/User')


function checaAutorizacao (req, res, next)
{
    const autorizar = req.headers['authorization'];
    const token = autorizar && autorizar.split(' ')[1]
    if(!token){
        return res.status(401).json({ msg:"acesso negado"})
    }
try{
    const secret = process.env.SECRET
    jwt.verify(token, secret)
    next()
}catch(error){
    console.log(error)
}


}


app.get('/', (req, res)=>{
    res.status(200).json({msg:"Bem "})

})


app.post('/auth/register', async (req, res)=>{

const {nome, email, senha} = req.body;

if(!nome){
 return res.status(422).json({msg:'O nome é obrigatorio!'})
}
if(!email){
    return res.status(422).json({msg:'O email é obrigatorio!'})
   }
if(!senha){
    return res.status(422).json({msg:'O senha é obrigatorio!'})
   }
      

   const userExists = await User.findOne({email:email});
   if(userExists){
    return res.status(422).json({msg:"por favor, utilize outro emaiol"})
   }
   const salt = await bcrypt.genSalt(12)
   const senhaHash = await bcrypt.hash(senha, salt)

   const user = new User({
    nome,
    email,
    senha:senhaHash,

   })
       
   try{
    await  user.save()
    res.status(201).json({msg:"Usuario criado com sucesso !"})
}catch(error){
    console.log(error)
    res.status(500).json({msg:"aconteu um erro "})
   }

});


app.post("/auth/login", async (req,res)=>{
    
    const {email, senha} = req.body;

    const user = await User.findOne({email:email});
    if(!user){
                return  res.status(404).json({msg:"Usuario senha não confere "})
    }
   
    const checarSenha = await bcrypt.compare(senha, user.senha);

    if(!checarSenha){
        return  res.status(404).json({msg:"Usuario senha não confere "})
}


try{
    const secret = process.env.SECRET
    const token = jwt.sign(
  {
        id: user._id,
    },
    secret, { expiresIn: '1h' }
    )
    res.status(200).json({msg:"Login efetuado !", token})
}catch(error){
    console.log(error);
    res.status(500).json({
        msg:"Aconteu algum erro no servidor!"
    })
}



   

});


app.get("/lista", checaAutorizacao, async (req,res)=> {

   const user = await User.find();

   const resultadoFormatado = user.map(resultado => ({
    id: resultado._id,
    email: resultado.email,
    nome: resultado.nome,
    // Adicione mais campos ou faça outras manipulações necessárias
  }));


res.json(resultadoFormatado);

})


app.get("/lista/:id", checaAutorizacao, async (req,res)=> {
 const id = req.params.id;
    const user = await User.findById(id);
 if(!user){
        return res.status(401).json( {msg:'sem permisaçi' })
    }

    const resultadoFormatado = {
        id: user._id,
        nome: user.nome,
        email: user.email
      };


 res.json(resultadoFormatado);
 
 })
 

 app.delete("/lista/:id", checaAutorizacao, async (req,res)=> {
    const id = req.params.id;
       const user = await User.deleteOne({_id:id});
   
       if(!user){
           return res.status(401).json( {msg:'sem permisaçi' })
       }
    res.status(200).json({msg:"deletado com sucesso!"});
    
    })
    

    app.put("/lista/:id", async (req, res)=>{
        const id = req.params.id;
        
        const {nome,email,senha} = req.body;
      
        const salt = await bcrypt.genSalt(12)
        const senhaHash = await bcrypt.hash(senha, salt)


        const user = await User.findOneAndUpdate({_id:id}, {$set: {nome, email, senha:senhaHash}});
        if(!user){
            return res.status(401).json( {msg:'sem resgistro' })
        }

      
        const response = {
            id: user._id,
            nome: user.nome,
            email: user.email
            // Adicione aqui outras propriedades que deseja retornar
          };
    

        res.json(response);

    })


app.listen(4000, ()=>{console.log('Conectou ao banco!');});

